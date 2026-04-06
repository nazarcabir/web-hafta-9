import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppGraphqlModule } from './graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    EventsModule,
    AppGraphqlModule,
  ],
})
export class AppModule {}
