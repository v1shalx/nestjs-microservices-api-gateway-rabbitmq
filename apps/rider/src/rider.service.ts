import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rider } from './rider.entity';
import { Repository } from 'typeorm';
import { CreateRiderDTO } from './dto/create-rider.dto';

@Injectable()
export class RiderService {
  constructor(
    @InjectRepository(Rider)
    private readonly riderRepository: Repository<Rider>,
  ) {}

  async findById(id: any) {
    return this.riderRepository.findOneBy({ id: id });
  }

  create(createUserDto: CreateRiderDTO): Promise<Rider> {
    const rider = new Rider();
    rider.firstName = createUserDto.firstName;
    rider.lastName = createUserDto.lastName;
    rider.email = createUserDto.email;
    rider.userId = createUserDto.userId;

    return this.riderRepository.save(rider);
  }

  async findAll(): Promise<Rider[]> {
    return this.riderRepository.find();
  }
}
