import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailOutboxEntity } from './entities/email-outbox.entity';

@Injectable()
export class EmailerService implements OnModuleInit {
  constructor(
    @InjectRepository(EmailOutboxEntity)
    private readonly emailRepo: Repository<EmailOutboxEntity>,
  ) {}

  onModuleInit() {
    // async background worker
    setInterval(() => this.processOutbox().catch(() => null), 10000);
  }

  async enqueueOrderPlaced(event: { orderId: string; userEmail: string }) {
    await this.emailRepo.save({
      orderId: event.orderId,
      toEmail: event.userEmail,
      subject: `Order placed: ${event.orderId}`,
      body: `Your order ${event.orderId} is placed successfully.`,
      status: 'PENDING',
      attempts: 0,
      sentAt: null,
    });
    return { ok: true };
  }

  private async processOutbox() {
    const batch = await this.emailRepo.find({
      where: { status: 'PENDING' },
      take: 10,
      order: { createdAt: 'ASC' },
    });

    if (!batch.length) return;

    for (const msg of batch) {
      msg.status = 'SENDING';
      msg.attempts += 1;
      await this.emailRepo.save(msg);

      try {
        // later replace with real provider
        console.log(`[EMAIL] sending to=${msg.toEmail} subject=${msg.subject}`);
        msg.status = 'SENT';
        msg.sentAt = new Date();
        await this.emailRepo.save(msg);
      } catch {
        msg.status = msg.attempts >= 5 ? 'FAILED' : 'PENDING';
        await this.emailRepo.save(msg);
      }
    }
  }
}
