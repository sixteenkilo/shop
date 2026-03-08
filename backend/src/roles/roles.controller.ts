import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async createRole(@Body() dto: CreateRoleDto) {
    const role = await this.rolesService.createRole(dto);
    return {
      message: 'Роль создана!',
      role,
    };
  }

  @Patch(':id')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.updateRole(dto, id);

    return {
      message: 'Роль обновлена!',
      role,
    };
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.destroy(id);

    return {
      message: 'Роль удалена!',
    };
  }

  @Get()
  getRoles() {
    return this.rolesService.getRoles();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getById(id);
  }
}
