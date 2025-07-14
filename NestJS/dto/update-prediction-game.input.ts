import { IsMongoId } from 'class-validator';
import { CreatePredictionGameInput } from './create-prediction-game.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePredictionGameInput extends PartialType(
  CreatePredictionGameInput,
) {
  @IsMongoId()
  @Field((type) => String, { nullable: true, description: 'Prediction ID' })
  _id?: string;
}
