import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GatewayService } from './gateway.service';

@Controller('users') // Prefix routes with /users
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) { }

  @Get('health')
  getHealth() {
    return { status: 'OK', service: 'API Gateway', timestamp: new Date().toISOString() };
  }

  @Post()
  createUser(@Body() createUserDto: { email: string; passwordHash: string }) {
    return this.authClient.send({ cmd: 'createUser' }, createUserDto);
  }
}
