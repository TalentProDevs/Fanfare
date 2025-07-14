/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, raw } from '@nestjs/mongoose';
import { SponsoredBrand } from './sponsoredBrand.entity';

@ObjectType()
export class CoSponsored {
  @Field((type) => SponsoredBrand, {
    nullable: true,
    description: 'Sponsored Brand Object',
  })
  @Prop(raw({ ...SponsoredBrand }))
  sponsoredBrand?: SponsoredBrand;

  @Field((type) => String, { nullable: true, description: 'Destination Link' })
  @Prop({ type: String })
  destinationLink?: string;
}
