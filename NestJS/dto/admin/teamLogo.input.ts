import { Field, InputType } from "@nestjs/graphql";
import { IsNumber } from "class-validator";
import { FileUpload, GraphQLUpload } from "graphql-upload";

@InputType()
export class TeamLogoInputDto{
      @Field((type) => GraphQLUpload, { description: 'Logo Url'})
      logo: FileUpload | string;

      @Field(()=>Number,{nullable:false})
      @IsNumber()
      height:number
      
      @Field(()=>Number,{nullable:false})
      @IsNumber()
      width:number
}