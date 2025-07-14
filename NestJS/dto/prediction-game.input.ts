import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class PredictionGameInput {
  @Field(() => String)
  predictionGameId: string;

  @Field(() => String)
  optionId: string;
}
