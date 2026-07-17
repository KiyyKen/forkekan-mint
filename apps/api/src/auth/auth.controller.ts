import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { AuthService, LoginResult, MeResult } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  loginWithGoogle(@Body() dto: GoogleLoginDto): Promise<LoginResult> {
    return this.authService.loginWithGoogle(dto.idToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload): Promise<MeResult> {
    return this.authService.getMe(user.sub);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(): { success: boolean } {
    // JWT bersifat stateless (docs/07: Design Principles — Stateless);
    // sesi berakhir dengan menghapus token di sisi client.
    return { success: true };
  }
}
