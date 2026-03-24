import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Пожалуйста введите корректный email' })
  @IsNotEmpty({ message: 'Пожалуйста введите email' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пожалуйста введите пароль' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Пожалуйста введите имя' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  name: string;

  @IsOptional()
  @IsArray({ message: 'roleIds должны быть массивом' })
  @ArrayUnique({ message: 'roleIds не должны содержать дубликаты' })
  @IsInt({ each: true, message: 'Каждый id роли должен быть числом' })
  roleIds?: number[];
}
