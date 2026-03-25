import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Название категории должно быть строкой' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Укажите название категории' })
  @Length(2, 255, {
    message: 'Название категории должно быть от 2 до 255 символов',
  })
  @Matches(/^[A-Za-zА-Яа-яЁё0-9\s\-_]+$/u, {
    message:
      'Название может содержать буквы (латиница и кириллица), цифры, пробел, дефис и подчёркивание',
  })
  value: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;
}
