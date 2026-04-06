import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { joint } from 'path';
import { EventsResolver } from './resolvers/events.resolver';
import { ParticipantsLoader } from './dataloader/participants.loader';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
  ],
  providers: [EventsResolver, ParticipantsLoader],
})
export class AppGraphqlModule {}
