/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { VoteInfo } from './voteInfo.entity';

@ObjectType()
@Schema({ _id: true })
export class QuizOption {
  @Field(() => String, { nullable: true, description: 'ID of game option' })
  _id?: mongoose.Types.ObjectId;

  @Field(() => String, {
    nullable: true,
    description: 'Main Text of quiz option',
  })
  @Prop({ type: String })
  mainText?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Sub Text of quiz option',
  })
  @Prop({ type: String })
  subText?: string;

  @Field(() => [VoteInfo], {
    nullable: true,
    description: 'Object of vote details',
  })
  @Prop([{ type: VoteInfo }])
  vote?: VoteInfo[];

  @Field(() => Number, { nullable: true, description: 'Total vote of option' })
  @Prop({ type: Number, default: 0 })
  optionVote?: number;

  @Field((type) => String, { nullable: true, description: 'Image for option' })
  @Prop({ type: String })
  optionImage?: string;

  @Field((type) => Boolean, { nullable: true })
  @Prop({ type: Boolean })
  isVoted?: boolean;

  @Field((type) => Boolean, { nullable: true })
  @Prop({ type: Boolean })
  isCorrect?: boolean;
}
