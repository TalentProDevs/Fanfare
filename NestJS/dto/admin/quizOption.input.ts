
import { Field, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class QuizOptionInput {
  @Field(() => String, { nullable: true, description: 'Main Text of game' })
  mainText?: string;

  @Field(() => String, { nullable: true, description: 'Sub Text of game' })
  subText?: string;

  @Field((type) => GraphQLUpload, {
    nullable: true,
    description: 'Option Image',
  })
  optionImage?: FileUpload | string;
}
