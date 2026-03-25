import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoleCode, Roles } from '../auth/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.ADMIN)
  @Post()
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.createCategory(dto);
    return {
      message: 'Категория создана!',
      category,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.ADMIN)
  @Patch(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.updateCategory(dto, id);
    return {
      message: 'Категория обновлена!',
      category,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.ADMIN)
  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.destroy(id);
    return {
      message: 'Категория удалена!',
    };
  }

  @Get()
  getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getById(id);
  }
}
