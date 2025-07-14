import { GameTypeEnum } from "@/src/live_score_sponsore/enums";
import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Series } from "./series.entity";
import { User } from "@/src/users/entities";
import mongoose from "mongoose";
import { TeamLogoInfo } from ".";
import { Status } from "@/src/prediction-settings/enum/status.enum";


export type TeamBySeriesDocument = TeamBySeries & Document;

@ObjectType()
@Schema({timestamps:true})
export class TeamBySeries{
    @Field(()=>String,{nullable:true})
    _id?:string

    @Field(()=>String,{nullable:true})
    @Prop({type:String, enum:GameTypeEnum})
    gameType?:GameTypeEnum

    @Field(()=>Series,{nullable:true})
    @Prop({type:raw({ ...Series})})
    series?:Series

    @Field(()=>String,{nullable:true})
    @Prop({type:String})
    teamFullName?:string

    @Field(()=>String,{nullable:true})
    @Prop({type:String,defaultOptions:"Short name of the team"})
    teamName?:string

    @Field(()=>String,{nullable:true})
    @Prop({type:String})
    teamId?:string

    @Field(()=>TeamLogoInfo,{nullable:true})
    @Prop({type:raw({...TeamLogoInfo})})
    teamLogo?:TeamLogoInfo

    @Field(()=>String,{nullable:true})
    @Prop({type:String,enum:Status})
    status?:Status

    @Field(()=>User,{nullable:true})
    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'User'})
    createdBy?:User

    @Field(()=>User,{nullable:true})
    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'User'})
    lastUpdatedBy?:User

    @Field(()=>Date,{nullable:true})
    createdAt?:Date
}

export const TeamBySeriesSchema = SchemaFactory.createForClass(TeamBySeries)