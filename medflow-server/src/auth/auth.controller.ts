import { Body, Controller, Post, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: any) {
    const { fullName, email, password } = body;
    return this.authService.register(fullName, email, password);
  }

  @Post('verify')
  async verifyOtp(@Body() body: any) {
    const { email, code } = body;
    return this.authService.verifyOtp(email, code);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    const { email } = body;
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    const { email, code, newPassword } = body;
    return this.authService.resetPassword(email, code, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Body() body: any, @Headers('authorization') auth: string) {
    const { oldPassword, newPassword } = body;
    const token = auth.replace('Bearer ', '');
    return this.authService.changePassword(token, oldPassword, newPassword);
  }
}
