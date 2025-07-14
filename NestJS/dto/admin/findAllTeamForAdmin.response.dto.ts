import { Field, ObjectType } from "@nestjs/graphql";
import { TeamBySeries } from "../../entities";

@ObjectType()
export class FindAllTeamsFromAdminResponse{
    @Field(()=>Number,{nullable:true})
    totalCount?:number

    @Field(()=>[TeamBySeries],{nullable:true})
    teams?:TeamBySeries[]
}