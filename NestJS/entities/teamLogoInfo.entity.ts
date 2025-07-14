import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema } from "@nestjs/mongoose";

@ObjectType()
@Schema({_id:false})
export class TeamLogoInfo{
    @Field(()=>String,{nullable:true})
    @Prop({type:String})
    logo?:string

    @Field(()=>Number,{nullable:true})
    @Prop({type:Number})
    height?:number
    
    @Field(()=>Number,{nullable:true})
    @Prop({type:Number})
    width?:number
}