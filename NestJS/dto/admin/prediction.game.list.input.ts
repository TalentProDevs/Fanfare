import { Field, InputType } from '@nestjs/graphql';
import { SponsoredMatchListInput } from '@/src/live_score_sponsore/dto';
import { PredictionType } from '../../enums';


@InputType()
export class PredictionGameListInput extends SponsoredMatchListInput{

    @Field((type) => PredictionType, {
        nullable: true,
        description: 'Enum for Prediction Type',
      })
      predictionType?: PredictionType;
      @Field((type) => String, {
        nullable: true,
        description: ' Prediction Type V2',
      })
      predictionTypeV2?: string;
}
