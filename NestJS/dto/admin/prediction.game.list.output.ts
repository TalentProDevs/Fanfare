import { ObjectType, Field } from '@nestjs/graphql';
import { PredictionGame } from '../../entities';

@ObjectType()
export class PredictonGameList {
  @Field((type) => [PredictionGame], { nullable: true })
  predictionGameList?: PredictionGame[];

  @Field((type) => Number)
  totalGames?: number;
}
