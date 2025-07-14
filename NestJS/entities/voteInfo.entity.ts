

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  _id: false,
  timestamps: true,
})
@ObjectType()
export class VoteInfo {
  @Field(() => String, { nullable: true, description: 'ID of User who voted' })
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  votedUser?: string;
}
