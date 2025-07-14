import { GameTypeEnum } from "@/src/live_score_sponsore/enums";
import { Status } from "@/src/prediction-settings/enum/status.enum";
import { StartAndEndDateInput } from "@/src/users/dto";
import { Field, InputType } from "@nestjs/graphql";


@InputType()
export class FindAllTeamsFromAdminInput{

    @Field(()=>Number)
    perPage:number

    @Field(()=>Number)
    pageNumber:number

    @Field(()=>Boolean,{nullable:true})
    isCsv?:boolean

    @Field(()=>String,{nullable:true})
    teamName?:string

    @Field(()=>String,{nullable:true})
    seriesId?:string

    @Field(()=>GameTypeEnum,{nullable:true})
    gameType?:GameTypeEnum

    @Field(()=>String,{nullable:true})
    teamFullName?:string

    @Field(()=>Status,{nullable:true})
    status?:Status

    @Field(()=>StartAndEndDateInput,{nullable:true})
    createdAt?:StartAndEndDateInput
}