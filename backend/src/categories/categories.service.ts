import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async getById(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const [valueTaken, slugTaken] = await Promise.all([
      this.existsCategoryValue(dto.value),
      this.existsCategorySlug(dto.slug),
    ]);

    if (valueTaken) {
      throw new HttpException(
        'Категория с таким названием уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (slugTaken) {
      throw new HttpException(
        'Категория с таким slug уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.category.create({ data: dto });
  }

  async updateCategory(dto: UpdateCategoryDto, id: number): Promise<Category> {
    const current = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!current) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    if (dto.value !== undefined && dto.value !== '') {
      const taken = await this.existsCategoryValue(dto.value, id);
      if (taken) {
        throw new HttpException(
          'Категория с таким названием уже существует',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (dto.slug !== undefined && dto.slug !== '') {
      const taken = await this.existsCategorySlug(dto.slug, id);
      if (taken) {
        throw new HttpException(
          'Категория с таким slug уже существует',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const data: { value?: string; slug?: string; description?: string | null } = {};

    if (dto.value !== undefined) {
      data.value = dto.value;
    }
    if (dto.slug !== undefined) {
      data.slug = dto.slug;
    }
    if (dto.description !== undefined) {
      data.description = dto.description === '' ? null : dto.description;
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async destroy(id: number): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  async existsCategoryValue(value: string, excludeId?: number): Promise<boolean> {
    const row = await this.prisma.category.findFirst({
      where: {
        value,
        ...(excludeId !== undefined && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });

    return !!row;
  }

  async existsCategorySlug(slug: string, excludeId?: number): Promise<boolean> {
    const row = await this.prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId !== undefined && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });

    return !!row;
  }
}
