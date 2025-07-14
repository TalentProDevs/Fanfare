/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { QuizOption } from './quizOption.entity';

@ObjectType()
@Schema({ _id: false })
export class PredictionGameQuiz {
  @Field(() => String, { nullable: true, description: 'ID of Quiz' })
  _id?: mongoose.Types.ObjectId;

  @Field(() => String, { nullable: true, description: 'Question of game' })
  @Prop({ type: String })
  question?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Correct Answer of game',
  })
  @Prop({ type: String })
  correctAns?: string;

  @Field(() => Number, { nullable: true, description: 'Total options of game' })
  @Prop({ type: Number })
  totalOptions?: number;

  @Field(() => Number, { nullable: true })
  @Prop({ type: Number, default: 0 })
  totalVote?: number;

  @Field(() => [QuizOption], {
    nullable: true,
    description: 'Option object of game',
  })
  @Prop([QuizOption])
  quizOptions?: QuizOption[];
}
