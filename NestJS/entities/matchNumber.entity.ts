/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

@ObjectType()
@Schema({ _id: false })
export class MatchNumber {
  @Field((type) => String, { nullable: true, description: 'ID of Match' })
  @Prop({ type: String })
  id?: string;

  @Field((type) => String, { nullable: true, description: 'Number of Match' })
  @Prop({ type: String })
  number?: string;
}
