import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService, AuthService, AuthGuard],
})
export class ApiGatewayModule {}
