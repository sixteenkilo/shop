import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
