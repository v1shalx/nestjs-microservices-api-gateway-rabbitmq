import { Test, TestingModule } from '@nestjs/testing';
import { EmailerController } from './emailer.controller';

describe('EmailerController', () => {
  let controller: EmailerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailerController],
    }).compile();

    controller = module.get<EmailerController>(EmailerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
