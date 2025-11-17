import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt';
import { User_Accounts } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User_Accounts)
    private readonly userRepository: Repository<User_Accounts>,
  ) {}

  async findUserByEmail(email: string): Promise<User_Accounts | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid email or password');

    return user;
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
      first_name: user.first_name,
      last_name: user.last_name,
      license_no: user.license_no,
      prc_type: user.prc_type,
      doctor_availability: user.doctor_availability,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    // ✅ FIXED COOKIE SETTINGS FOR HTTPS + CROSS-ORIGIN
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      role: user.role,
      status: user.status,
      doctor_availability: user.doctor_availability,
    });
  }

  async logout(res: Response) {
    res.clearCookie('jwt');
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  async getProfile(req: Request) {
    try {
      const token = req.cookies['jwt'];
      if (!token) throw new UnauthorizedException('Not authenticated');

      const decoded = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { user_id: decoded.sub },
      });

      if (!user) throw new UnauthorizedException('User not found');

      const { password, ...safeUser } = user;
      return {
        ...safeUser,
        doctor_availability: user.doctor_availability,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async register(
    email: string,
    password: string,
    first_name: string,
    middle_name: string,
    last_name: string,
    license_no: string,
    prc_type: string,
    res: Response,
  ) {
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      first_name,
      middle_name,
      last_name,
      role: 'Admin',
      license_no,
      prc_type,
      status: 'Active',
    });

    await this.userRepository.save(newUser);

    const payload = {
      sub: newUser.user_id,
      email: newUser.email,
      role: newUser.role,
      license_no: newUser.license_no,
      prc_type: newUser.prc_type,
      first_name: newUser.first_name,
      middle_name: newUser.middle_name,
      last_name: newUser.last_name,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Registration successful',
      role: newUser.role,
    });
  }
}
