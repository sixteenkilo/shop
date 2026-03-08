import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private selectWithoutPassword = {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  async getUsers(): Promise<UserWithoutPassword[]> {
    return this.prisma.user.findMany({
      select: this.selectWithoutPassword,
    });
  }

  async getById(id: number): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.selectWithoutPassword,
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async createUser(dto: CreateUserDto): Promise<UserWithoutPassword> {
    const exists = await this.existsUser(dto.email);

    if (exists) {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
      select: this.selectWithoutPassword,
    });
  }

  async updateUser(
    dto: UpdateUserDto,
    id: number,
  ): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    if (dto.email && dto.email !== user.email) {
      const exists = await this.existsUser(dto.email);
      if (exists) {
        throw new HttpException(
          'Пользователь с таким email уже существует',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const data: { email?: string; password?: string; name?: string } = {
      ...dto,
    };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: this.selectWithoutPassword,
    });
  }

  async destroy(id: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async existsUser(email: string, excludeId?: number): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        ...(excludeId !== undefined && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });

    return !!user;
  }
}
