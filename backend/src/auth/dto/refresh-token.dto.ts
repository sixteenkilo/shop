import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'refreshToken должен быть строкой' })
  @IsNotEmpty({ message: 'Пожалуйста укажите refreshToken' })
  refreshToken: string;
}

