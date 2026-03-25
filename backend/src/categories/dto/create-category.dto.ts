import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Код категории должен быть строкой' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Укажите код категории' })
  @Length(2, 255, {
    message: 'Код категории должен быть от 2 до 255 символов',
  })
  @Matches(/^[A-Za-z0-9\s\-_]+$/, {
    message:
      'Код может содержать латиницу, цифры, пробел, дефис и подчёркивание',
  })
  value: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @Length(3, 255, {
    message: 'Описание должно содержать от 3 до 255 символов',
  })
  description?: string;
}
