
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MatchNumberInput {
  @Field((type) => String, { nullable: true, description: 'ID of Match' })
  id?: string;

  @Field((type) => String, { nullable: true, description: 'Number of Match' })
  number?: string;
}
