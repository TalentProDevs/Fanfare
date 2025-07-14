/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

@ObjectType('Series_Output_Entity')
export class Series {
  @Field((type) => String, { nullable: true, description: 'ID of Series' })
  @Prop({ type: String })
  id?: string;

  @Field((type) => String, { nullable: true, description: 'Name of Series' })
  @Prop({ type: String })
  name?: string;
}
