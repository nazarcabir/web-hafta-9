import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, creatorId: number) {
    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
        creatorId,
      },
    });

    // Send Webhook (G5)
    this.sendWebhook(event);

    return event;
  }

  async findAll(page: number = 1, limit: number = 10, category?: string, city?: string, sort: string = 'date', order: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;
    const where = {
      ...(category && { category }),
      ...(city && { city }),
    };

    const [total, items] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: { creator: { select: { id: true, name: true } } },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        attendances: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const data = { ...updateEventDto };
    if (data.date) data.date = new Date(data.date) as any;
    
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.event.delete({ where: { id } });
  }

  private async sendWebhook(event: any) {
    const webhookUrl = process.env.GO_SERVICE_URL || 'http://go-service:8080/api/v1/webhooks/events';
    const secret = process.env.WEBHOOK_SECRET || 'your-webhook-secret-key';
    
    const payload = {
      event: 'event.created',
      data: {
        id: event.id,
        title: event.title,
        date: event.date,
      },
    };

    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    try {
      await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
      });
      console.log(`Webhook sent for event ${event.id}`);
    } catch (error) {
      console.error(`Failed to send webhook: ${error.message}`);
      // Don't throw error to avoid failing the event creation
    }
  }
}
