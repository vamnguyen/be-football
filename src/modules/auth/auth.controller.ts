import {
  Body,
  Controller,
  Get,
  Post,
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

    return res.json({
      message: 'Signup successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
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

    return res.json({
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
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
      throw new UnauthorizedException('Refresh token not found');
    }

    const deviceInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const tokens = await this.authService.refreshTokenPair(
      refreshToken,
      deviceInfo,
    );
    this.setCookie(res, tokens);

    return res.json({ message: 'Token refreshed successfully' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
