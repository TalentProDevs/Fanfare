

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, raw } from '@nestjs/mongoose';
import { TopBottomBanner } from './topBottomBanner.entity';
import { SponsoredBrand } from './sponsoredBrand.entity';

@ObjectType()
export class TitleSponsored {
  @Field((type) => SponsoredBrand, {
    nullable: true,
    description: 'Sponsored Brand Object',
  })
  @Prop(raw({ ...SponsoredBrand }))
  sponsoredBrand?: SponsoredBrand;

  @Field((type) => TopBottomBanner, {
    nullable: true,
    description: 'Top/bottom banner object',
  })
  @Prop(raw({ ...TopBottomBanner }))
  topBanner?: TopBottomBanner;
}
