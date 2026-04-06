import { Test, TestingModule } from '@nestjs/testing';
import { EventsResolver } from './events.resolver';
import { PrismaService } from '../../prisma/prisma.service';
import { ParticipantsLoader } from '../dataloader/participants.loader';
import { BadRequestException } from '@nestjs/common';

describe('EventsResolver', () => {
  let resolver: EventsResolver;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsResolver,
        {
          provide: PrismaService,
          useValue: {
            event: { findUnique: jest.fn() },
            attendance: { findUnique: jest.fn(), create: jest.fn() },
          },
        },
        { provide: ParticipantsLoader, useValue: {} },
      ],
    }).compile();

    resolver = module.get<EventsResolver>(EventsResolver);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should reject joining if event is full', async () => {
    jest.spyOn(prisma.event, 'findUnique').mockResolvedValue({
      id: 1,
      maxParticipants: 10,
      _count: { attendances: 10 },
    } as any);

    await expect(resolver.joinEvent(1, { userId: 1 }))
      .rejects.toThrow(BadRequestException);
  });
});
