import { IsNotEmpty, IsString, IsInt, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The biggest tech conference in the city', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'tech' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'istanbul' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '2026-05-10T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  maxParticipants: number;
}
