import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthenticationService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('RIDER_SERVICE') private riderService: ClientProxy,
  ) {}
  async register(userDTO: Prisma.UserCreateInput) {
    try {
      console.log('called authenticaton service register', userDTO);
      const hashedPassword = await bcrypt.hash(userDTO.password, 10);
      const user = await this.prisma.user.create({
        data: { email: userDTO.email, password: hashedPassword },
      });
      // call the rider microservice with create-rider command and we will provide
      // firstName, lastName, and userId
      const rider = await firstValueFrom(
        this.riderService.send(
          { cmd: 'create-rider' },
          { userId: user.id, ...userDTO },
        ),
      );
      console.log('rider', rider);
    return { userId: user.id, email: user.email };

    } catch (error) {
      console.error('Error while registering user', error);
      throw new Error(error);
    }
  }
  async login(userDTO: Prisma.UserCreateInput) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: userDTO.email },
      });
      if (!user || !(await bcrypt.compare(userDTO.password, user.password))) {
        throw new Error('Invalid credentials');
      }

      const token = this.jwtService.sign({
        userId: user.id,
        email: user.email,
      });
      return { access_token: token };
    } catch (error) {
      throw new Error(error);
    }
  }
  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      throw new Error('Invalid token');
    }
  }
}
