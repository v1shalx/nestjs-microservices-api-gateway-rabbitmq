import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EmailerService } from './emailer.service';

@Controller()
export class EmailerController {
  constructor(private readonly emailerService: EmailerService) {}

  @EventPattern('order.placed')
  onOrderPlaced(event: { orderId: string; userEmail: string }) {
    return this.emailerService.enqueueOrderPlaced(event);
  }
}
