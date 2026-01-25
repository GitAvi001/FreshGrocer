import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) { }

  @MessagePattern({ cmd: 'register' })
  async register(data: RegisterUserDto) {
    return this.authServiceService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(data: LoginUserDto) {
    return this.authServiceService.login(data);
  }

  @MessagePattern({ cmd: 'validateToken' })
  async validateToken(data: { token: string }) {
    return this.authServiceService.validateToken(data.token);
  }

  @MessagePattern({ cmd: 'getUserById' })
  async getUserById(data: { id: number }) {
    return this.authServiceService.findUserById(data.id);
  }

  @MessagePattern({ cmd: 'createUser' })
  async createUser(data: { email: string; passwordHash: string }) {
    return this.authServiceService.createUser(data.email, data.passwordHash);
  }

  @MessagePattern({ cmd: 'getUser' })
  async getUser(data: { email: string }) {
    return this.authServiceService.findUserByEmail(data.email);
  }
}
