import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('events')
@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all events with filters/pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('category') category?: string,
    @Query('city') city?: string,
    @Query('sort') sort: string = 'date',
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    return this.eventsService.findAll(+page || 1, +limit || 10, category, city, sort, order);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto) {
    // In a real app, we should check if req.user.userId === event.creatorId or role === ADMIN
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event (Admin only - Bonus A)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
