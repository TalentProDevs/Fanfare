

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

@ObjectType()
export class TopBottomBanner {
  @Field((type) => String, {
    nullable: true,
    description: 'Top/bottom Banner URL',
  })
  @Prop({ type: String })
  url?: string;

  @Field((type) => String, {
    nullable: true,
    description: 'Top/bottom Banner URL',
  })
  @Prop({ type: String })
  bannerImage?: string;

  @Field((type) => String, { nullable: true, description: 'Destination Link' })
  @Prop({ type: String })
  destinationLink?: string;
}
