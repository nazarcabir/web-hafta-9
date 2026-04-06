import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent, Context } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { EventType, UserType } from '../types/event.type';
import { ParticipantsLoader } from '../dataloader/participants.loader';
import { UseGuards, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtGqlAuthGuard } from '../../auth/guards/jwt-gql-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver(() => EventType)
export class EventsResolver {
  constructor(
    private prisma: PrismaService,
    private participantsLoader: ParticipantsLoader,
  ) {}

  @Query(() => [EventType])
  async events() {
    return this.prisma.event.findMany({
      include: { creator: true },
    });
  }

  @Query(() => EventType, { nullable: true })
  async event(@Args('id', { type: () => Int }) id: number) {
    return this.prisma.event.findUnique({
      where: { id },
      include: { creator: true },
    });
  }

  @Query(() => [EventType])
  @UseGuards(JwtGqlAuthGuard)
  async myEvents(@CurrentUser() user: any) {
    return this.prisma.event.findMany({
      where: { attendances: { some: { userId: user.userId } } },
      include: { creator: true },
    });
  }

  @Mutation(() => EventType)
  @UseGuards(JwtGqlAuthGuard)
  async joinEvent(
    @Args('eventId', { type: () => Int }) eventId: number,
    @CurrentUser() user: any,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { attendances: true } } },
    });

    if (!event) throw new BadRequestException('Event not found');
    if (event._count.attendances >= event.maxParticipants) {
      throw new BadRequestException('Event is full');
    }

    const existing = await this.prisma.attendance.findUnique({
      where: { userId_eventId: { userId: user.userId, eventId } },
    });
    if (existing) throw new ConflictException('Already joined');

    await this.prisma.attendance.create({
      data: { userId: user.userId, eventId },
    });

    return event;
  }

  @Mutation(() => EventType)
  @UseGuards(JwtGqlAuthGuard)
  async leaveEvent(
    @Args('eventId', { type: () => Int }) eventId: number,
    @CurrentUser() user: any,
  ) {
    await this.prisma.attendance.delete({
      where: { userId_eventId: { userId: user.userId, eventId } },
    });
    return this.prisma.event.findUnique({ where: { id: eventId } });
  }

  @ResolveField(() => [UserType])
  async participants(@Parent() event: EventType) {
    return this.participantsLoader.loader.load(event.id);
  }
}
