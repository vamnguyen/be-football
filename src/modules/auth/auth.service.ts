import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { IDeviceInfo } from 'src/core/interfaces/entities';
import { UsersService } from '../users/users.service';
import { User } from 'src/entities';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_PRIVATE_KEY,
  ACCESS_TOKEN_PUBLIC_KEY,
  REFRESH_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PUBLIC_KEY,
} from 'src/core/utils/key.util';
import { ConfigService } from '@nestjs/config';
import { IAuthToken } from 'src/core/interfaces/entities';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { ITokenPayload } from 'src/core/interfaces/entities/token-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateLogin(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) return null;

    return user;
  }

  private async generateTokens(user: User): Promise<IAuthToken> {
    const payload: Omit<ITokenPayload, 'type'> = {
      id: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          algorithm: 'RS256',
          privateKey: ACCESS_TOKEN_PRIVATE_KEY,
          expiresIn: this.configService.get('jwt.accessToken.expiresIn') * 1000,
        },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          algorithm: 'RS256',
          privateKey: REFRESH_TOKEN_PRIVATE_KEY,
          expiresIn:
            this.configService.get('jwt.refreshToken.expiresIn') * 1000,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn:
        this.configService.get('jwt.accessToken.expiresIn') * 1000,
      refreshTokenExpiresIn:
        this.configService.get('jwt.refreshToken.expiresIn') * 1000,
    };
  }

  async signup(
    signupDto: SignupDto,
    deviceInfo: IDeviceInfo,
  ): Promise<IAuthToken> {
    try {
      const user = await this.usersService.create(signupDto);

      // Generate tokens and save refresh token to database
      const tokens = await this.generateTokens(user);
      await this.refreshTokenRepository.create({
        user,
        token: tokens.refreshToken,
        deviceInfo,
      });

      await this.usersService.update(user.id, {
        lastLoginAt: new Date(),
        isOnline: true,
      });

      return tokens;
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      this.logger.error(`Failed to signup: ${error.message}`);
      throw new InternalServerErrorException('Failed to signup');
    }
  }

  async login(user: User, deviceInfo: IDeviceInfo): Promise<IAuthToken> {
    try {
      // Generate tokens and save refresh token to database
      const tokens = await this.generateTokens(user);
      await this.refreshTokenRepository.create({
        user,
        token: tokens.refreshToken,
        deviceInfo,
      });

      await this.usersService.update(user.id, {
        lastLoginAt: new Date(),
        isOnline: true,
      });

      return tokens;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Failed to login: ${error.message}`);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  async logout(user: User, refreshToken: string) {
    try {
      const token =
        await this.refreshTokenRepository.findValidToken(refreshToken);
      if (!token) throw new UnauthorizedException('Invalid refresh token');

      await this.refreshTokenRepository.revokeToken(refreshToken);
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`);
      throw new InternalServerErrorException('Error during logout');
    }
  }

  async refreshTokenPair(refreshToken: string, deviceInfo: IDeviceInfo) {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);

      const user = await this.usersService.findById(payload.id);
      if (!user) throw new UnauthorizedException('User not found');

      const tokens = await this.generateTokens(user);
      await this.refreshTokenRepository.create({
        user,
        token: tokens.refreshToken,
        deviceInfo,
      });

      await this.usersService.update(user.id, {
        lastLoginAt: new Date(),
        isOnline: true,
      });

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;

      this.logger.error(`Error refreshing token pair: ${error.message}`);
      throw new InternalServerErrorException('Error refreshing token pair');
    }
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<ITokenPayload> {
    try {
      const token =
        await this.refreshTokenRepository.findValidToken(refreshToken);
      if (!token) throw new UnauthorizedException('Invalid refresh token');

      return this.jwtService.verifyAsync<ITokenPayload>(refreshToken, {
        secret: REFRESH_TOKEN_PUBLIC_KEY,
        algorithms: ['RS256'],
      });
    } catch (error) {
      this.logger.error(`Error verifying refresh token: ${error.message}`);

      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyAccessToken(accessToken: string): Promise<ITokenPayload> {
    try {
      return this.jwtService.verifyAsync<ITokenPayload>(accessToken, {
        secret: ACCESS_TOKEN_PUBLIC_KEY,
        algorithms: ['RS256'],
      });
    } catch (error) {
      this.logger.error(`Error verifying access token: ${error.message}`);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    const foundUser = await this.usersService.findByEmail(user.email);
    if (!foundUser) throw new NotFoundException('User not found');

    const isPasswordValid = foundUser.comparePassword(
      changePasswordDto.currentPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const salt = genSaltSync(10);
    const hashedPassword = hashSync(changePasswordDto.newPassword, salt);

    await this.userRepository.update(foundUser.id, {
      password: hashedPassword,
    });
  }
}
