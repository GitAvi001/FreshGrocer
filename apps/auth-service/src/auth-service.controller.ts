import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) { }

  @MessagePattern({ cmd: 'createUser' })
  async createUser(data: { email: string; passwordHash: string }) {
    return this.authServiceService.createUser(data.email, data.passwordHash);
  }

  @MessagePattern({ cmd: 'getUser' })
  async getUser(data: { email: string }) {
    return this.authServiceService.findUserByEmail(data.email);
  }
}
