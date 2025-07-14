import { InputType, Field, Int } from '@nestjs/graphql';
import { PaginationInputType } from '@/src/collaboration_events/dto';
import { PredictionGameRewardType } from '@/src/prediction-game-reward/enum/prediction-game-reward-type.enum';
import { IsEnum, IsString } from 'class-validator';
import { GameTypeEnum } from '@/src/live_score_sponsore/enums';

@InputType()
export class AdminLeaderboardInput extends PaginationInputType{
  
  @IsString()
  @Field(() => String)
  seriesId: string;

  @Field(() => String,{nullable:true})
  userName?: string;

  @Field(() => String,{nullable:true})
  userFfId?: string;

  @Field(() => Int,{nullable:true})
  position?: number;

  @IsEnum(PredictionGameRewardType)
  @Field(type => PredictionGameRewardType,{defaultValue:PredictionGameRewardType.PREDICTION_GAME})
  leaderboardType?: PredictionGameRewardType

  @IsEnum(GameTypeEnum)
  @Field(type => GameTypeEnum,{defaultValue:GameTypeEnum.CRICKET})
  gameType:GameTypeEnum
}
