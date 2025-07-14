
import { Field, InputType } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';
import { QuizOptionInput } from './quizOption.input';

@InputType()
@Schema({ _id: false })
export class PredictionGameQuizInput {
  @Field(() => String, { nullable: true, description: 'Question of game' })
  question?: string;

  @Field(() => Number, { nullable: true, description: 'Total options of game' })
  totalOptions?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Correct Answer of game',
  })
  correctAns?: string;

  @Field(() => [QuizOptionInput], {
    nullable: true,
    description: 'Option object of game',
  })
  quizOptions?: QuizOptionInput[];
}
