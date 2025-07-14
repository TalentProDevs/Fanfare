/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, raw } from '@nestjs/mongoose';
import { TopBottomBanner } from './topBottomBanner.entity';
import { SponsoredBrand } from './sponsoredBrand.entity';

@ObjectType()
export class SoloSponsored {
  @Field((type) => SponsoredBrand, {
    nullable: true,
    description: 'Sponsored Brand Object',
  })
  @Prop(raw({ ...SponsoredBrand }))
  sponsoredBrand?: SponsoredBrand;

  @Field((type) => TopBottomBanner, {
    nullable: true,
    description: 'Object for top banner',
  })
  @Prop(raw({ ...TopBottomBanner }))
  topBanner?: TopBottomBanner;

  @Field((type) => TopBottomBanner, {
    nullable: true,
    description: 'Object for bottom banner',
  })
  @Prop(raw({ ...TopBottomBanner }))
  bottomBanner?: TopBottomBanner;
}
