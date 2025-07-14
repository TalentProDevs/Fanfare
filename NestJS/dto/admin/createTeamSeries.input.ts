import { GameTypeEnum } from "@/src/live_score_sponsore/enums";
import { Field, InputType } from "@nestjs/graphql";
import { SeriesInput } from "./series.input";
import { TeamLogoInputDto } from "./teamLogo.input";
import { Status } from "@/src/prediction-settings/enum/status.enum";
import { IsEnum } from "class-validator";
import mongoose from "mongoose";

@InputType()
export class CreateTeamBySeriesInput{
    @Field(()=>GameTypeEnum)
    @IsEnum(GameTypeEnum)
    gameType:GameTypeEnum

    @Field(()=>SeriesInput)
    series:SeriesInput

    @Field(()=>String)
    teamFullName:string
    
    @Field(()=>String)
    teamName:string
    
    @Field(()=>String)
    teamId:string
    
    @Field(()=>TeamLogoInputDto)
    teamLogo:TeamLogoInputDto

    status?:Status

    createdBy?:mongoose.Types.ObjectId
}