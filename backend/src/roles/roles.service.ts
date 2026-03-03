import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getRoles(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async getById(id: number): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }

    return role;
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const exit = await this.existsRole(dto.value);

    if (exit) {
      throw new HttpException(
        `${dto.value} уже существует`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const role = await this.prisma.role.create({ data: dto });
    return role;
  }

  async updateRole(dto: UpdateRoleDto, id: number): Promise<Role> {
    if (dto.value) {
      const exists = await this.existsRole(dto.value, id);

      if (exists) {
        throw new HttpException(
          `${dto.value} уже существует`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  async destroy(id: number): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }

    await this.prisma.role.delete({
      where: { id },
    });
  }

  async existsRole(value: string, id?: number): Promise<boolean> {
    const role = await this.prisma.role.findFirst({
      where: {
        value,
        ...(id !== undefined && { NOT: { id } }),
      },
      select: { id: true },
    });

    return !!role;
  }
}
