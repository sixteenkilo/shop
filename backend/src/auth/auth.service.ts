import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiresInMs: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.refreshTokenExpiresInMs = 7 * 24 * 60 * 60 * 1000;
  }

  private async generateTokens(payload: { id: number; email: string }) {
    const accessToken = await this.jwtService.signAsync(
      { sub: payload.id, email: payload.email },
      {},
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: payload.id, email: payload.email, type: 'refresh' },
      {
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(this.refreshTokenExpiresInMs + Date.now());

    const existing = await this.prisma.token.findFirst({
      where: { userId },
    });

    if (existing) {
      await this.prisma.token.update({
        where: { id: existing.id },
        data: {
          refreshToken: hashedRefreshToken,
          expiresAt,
        },
      });
    } else {
      await this.prisma.token.create({
        data: {
          userId,
          refreshToken: hashedRefreshToken,
          expiresAt,
        },
      });
    }
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser(dto);

    const userRole = await this.prisma.role.findUnique({
      where: { value: 'USER' },
    });

    if (userRole) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          roles: {
            connect: { id: userRole.id },
          },
        },
      });
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      id: user.id,
      email: user.email,
    });

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  private async validateUser(email: string, password: string) {
    const dbUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!dbUser) {
      throw new HttpException(
        'Неверный email или пароль',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await bcrypt.compare(password, dbUser.password);

    if (!isMatch) {
      throw new HttpException(
        'Неверный email или пароль',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return dbUser;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    const { accessToken, refreshToken } = await this.generateTokens({
      id: user.id,
      email: user.email,
    });

    await this.saveRefreshToken(user.id, refreshToken);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('refreshToken обязателен', HttpStatus.BAD_REQUEST);
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new HttpException(
        'Невалидный refreshToken',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tokenRecord = await this.prisma.token.findFirst({
      where: { userId: payload.sub },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new HttpException(
        'refreshToken недействителен',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await bcrypt.compare(refreshToken, tokenRecord.refreshToken);

    if (!isMatch) {
      throw new HttpException(
        'refreshToken недействителен',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async logout(userId: number) {
    await this.prisma.token.deleteMany({
      where: { userId },
    });
  }
}
