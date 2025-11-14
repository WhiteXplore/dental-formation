import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthRequest } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    return this.authService.login(email, password, res);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthRequest) {
    return req.user;
  }
}
