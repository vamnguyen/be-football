import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IAuthToken } from 'src/core/interfaces/entities';
import { ConfigService } from '@nestjs/config';
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
      maxAge: this.configService.get('jwt.accessToken.expiresIn') * 1000, // 30 minutes
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: this.configService.get('jwt.refreshToken.expiresIn') * 1000, // 30 days
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
  @Public()
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const deviceInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const tokens = await this.authService.login(loginDto, deviceInfo);
    this.setCookie(res, tokens);

    return res.json({
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  @Post('logout')
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

    // Trả về kết quả cho client
    return res.json({
      message: 'Logout successful',
    });
  }
}
