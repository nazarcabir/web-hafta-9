import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable({ scope: Scope.REQUEST })
export class ParticipantsLoader {
  constructor(private prisma: PrismaService) {}

  public readonly loader = new DataLoader<number, User[]>(async (eventIds: number[]) => {
    const attendances = await this.prisma.attendance.findMany({
      where: { eventId: { in: eventIds } },
      include: { user: true },
    });

    const map = new Map<number, User[]>();
    eventIds.forEach((id) => map.set(id, []));
    attendances.forEach((att) => {
      map.get(att.eventId).push(att.user);
    });

    return eventIds.map((id) => map.get(id));
  });
}
