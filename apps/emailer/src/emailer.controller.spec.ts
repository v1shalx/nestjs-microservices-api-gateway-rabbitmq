import { Test, TestingModule } from '@nestjs/testing';
import { EmailerController } from './emailer.controller';
import { EmailerService } from './emailer.service';

describe('EmailerController', () => {
  let emailerController: EmailerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EmailerController],
      providers: [EmailerService],
    }).compile();

    emailerController = app.get<EmailerController>(EmailerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(emailerController.getHello()).toBe('Hello World!');
    });
  });
});
