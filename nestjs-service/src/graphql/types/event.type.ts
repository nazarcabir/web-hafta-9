import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

registerEnumType(Role, { name: 'Role' });

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => Role)
  role: Role;

  @Field(() => [EventType], { nullable: true })
  joinedEvents?: EventType[];
}

@ObjectType()
export class EventType {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  category: string;

  @Field()
  city: string;

  @Field()
  date: Date;

  @Field(() => Int)
  maxParticipants: number;

  @Field(() => Int)
  creatorId: number;

  @Field(() => UserType)
  creator: UserType;

  @Field(() => [UserType], { nullable: true })
  participants?: UserType[];
}
