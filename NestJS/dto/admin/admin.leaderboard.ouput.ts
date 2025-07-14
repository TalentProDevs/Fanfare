import { ObjectType, Field } from '@nestjs/graphql';
import { LeaderboardInfoOutput } from '.';
import { TopBottomBanner } from '@/src/live_score_sponsore/entities';
import { Series } from '../../entities';


@ObjectType()
export class AdminLeaderboardOutput {

  @Field((type) => String,{ nullable: true })
  _id?: string;

  @Field((type) => [LeaderboardInfoOutput], { defaultValue: [] })
  leaderBoard?: LeaderboardInfoOutput[];

  @Field((type) =>TopBottomBanner, { nullable: true })
  rewardBanner?: TopBottomBanner;

  @Field((type) => Number,{defaultValue:0})
  totalCount?: number;

  @Field((type) => String,{ nullable: true })
  notes?: string;

  @Field(type => Series,{nullable:true})
  series?: Series

  }
