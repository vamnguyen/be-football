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
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PRIVATE_KEY,
} from 'src/core/utils/key.util';
import { ConfigService } from '@nestjs/config';
import { IAuthToken } from 'src/core/interfaces/entities';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenRepository } from './repository/refresh-token.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  private async generateTokens(user: User): Promise<IAuthToken> {
    const payload = {
      id: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          algorithm: 'RS256',
          privateKey: ACCESS_TOKEN_PRIVATE_KEY,
          expiresIn: this.configService.get('jwt.accessToken.expiresIn'),
        },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          algorithm: 'RS256',
          privateKey: REFRESH_TOKEN_PRIVATE_KEY,
          expiresIn: this.configService.get('jwt.refreshToken.expiresIn'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
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

  async login(
    loginDto: LoginDto,
    deviceInfo: IDeviceInfo,
  ): Promise<IAuthToken> {
    try {
      // TODO: implement local guard then remove findByEmail and comparePassword below
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) throw new NotFoundException('User not found');

      const isPasswordValid = user.comparePassword(loginDto.password);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

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
}
