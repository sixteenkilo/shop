import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
