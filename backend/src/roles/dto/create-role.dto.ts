import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'Название роли должно быть строкой' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsNotEmpty({ message: 'У роли должно быть название' })
  @Length(2, 30, {
    message: 'Название роли должно содержать от 2 до 30 символов',
  })
  @Matches(/^[A-Z_]+$/, {
    message:
      'Название роли может содержать только заглавные латинские буквы и "_"',
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
