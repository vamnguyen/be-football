import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IAuthToken } from 'src/core/interfaces/entities';
import { ConfigService } from '@nestjs/config';
import { LocalAuthGuard } from '../../common/guards/local.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setCookie(res: Response, tokens: IAuthToken) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: tokens.accessTokenExpiresIn,
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: tokens.refreshTokenExpiresIn,
      path: '/',
    });
  }

  private clearCookie(res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
  }

  @Post('sign-up')
  @Public()
  async signup(
    @Body() signupDto: SignupDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const deviceInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const tokens = await this.authService.signup(signupDto, deviceInfo);
    this.setCookie(res, tokens);

    return res.json({ message: 'Signup successful' });
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Public()
  async login(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const deviceInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const tokens = await this.authService.login(user, deviceInfo);
    this.setCookie(res, tokens);

    return res.json({ message: 'Login successful' });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];

    if (refreshToken) {
      await this.authService.logout(user, refreshToken);
      this.clearCookie(res);
    }

    return res.json({
      message: 'Logout successful',
    });
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Yêu cầu xác thực: Vui lòng đăng nhập lại',
      );
    }

    const deviceInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    try {
      const tokens = await this.authService.refreshTokenPair(
        refreshToken,
        deviceInfo,
      );
      this.setCookie(res, tokens);

      return res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
      this.clearCookie(res);

      // If refresh token expired or invalid, return 410
      if (
        error instanceof UnauthorizedException &&
        (error.message.includes('expired') || error.message.includes('Invalid'))
      ) {
        throw new HttpException('Refresh token expired', HttpStatus.GONE);
      }

      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user, changePasswordDto);
  }
}
