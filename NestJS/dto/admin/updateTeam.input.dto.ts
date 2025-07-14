import { Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateTeamBySeriesInput } from ".";
import { IsMongoId } from "class-validator";
import mongoose from "mongoose";
import { Status } from "@/src/prediction-settings/enum/status.enum";


@InputType()
export class UpdateTeamInput extends PartialType(
    CreateTeamBySeriesInput,
) {
    @IsMongoId()
    @Field(()=>String,{nullable:false})
    _id:mongoose.Types.ObjectId

    @Field(()=>Status,{nullable:true})
    status?:Status

    lastUpdatedBy?:mongoose.Types.ObjectId
}