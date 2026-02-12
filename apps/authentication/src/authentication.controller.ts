import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';

@Controller()
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @MessagePattern({ cmd: 'register' })
  async register(
    @Payload()
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      userId: number;
    },
  ) {
    console.log('data in regsiter auth controller...', data);
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(
    @Payload()
    data: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login({
      email: data.email,
      password: data.password,
    });
  }

  @MessagePattern({ cmd: 'validate-token' })
  async validateToken(
    @Payload()
    token: string,
  ) {
    return this.authService.validateToken(token);
  }
}
