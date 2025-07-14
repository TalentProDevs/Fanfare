
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SeriesInput {
  @Field((type) => String, { nullable: true, description: 'ID of Series' })
  id?: string;

  @Field((type) => String, { nullable: true, description: 'Name of Series' })
  name?: string;
}
