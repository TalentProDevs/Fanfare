import { PredictionGame } from '@/src/users/entities';
import { ObjectType, Field, Int } from '@nestjs/graphql';


@ObjectType()
export class LeaderboardInfoOutput {

@Field((type) => String,{nullable:true})
userName?: string;

@Field((type) => String,{nullable:true})
userDp?: string;

@Field((type) => String,{nullable:true})
phone?: string;

@Field((type) => String,{nullable:true})
fanfareId?: string;

@Field((type) => String,{nullable:true})
userId?: string;

@Field((type) => Int,{defaultValue:2})
rewardPlace: number;

@Field((type) => String,{defaultValue:"Walton TV"})
rewardName: string;

@Field((type) => PredictionGame,{nullable:true})
predictionGame?: PredictionGame;
}
