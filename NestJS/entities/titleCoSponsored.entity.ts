
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, raw } from '@nestjs/mongoose';
import { TitleSponsored } from './titleSponsored.entity';
import { CoSponsored } from './coSponsored.entity';
import { SponsoredBrand } from './sponsoredBrand.entity';
import { TopBottomBanner } from './topBottomBanner.entity';

@ObjectType()
export class TitleCoSponsored {
  @Field((type) => SponsoredBrand, {
    nullable: true,
    description: 'Sponsored Brand Object',
  })
  @Prop(raw({ ...SponsoredBrand }))
  sponsoredBrand?: SponsoredBrand;

  @Field((type) => TopBottomBanner, {
    nullable: true,
    description: 'Object for top/bottom banner',
  })
  @Prop(raw({ ...TopBottomBanner }))
  topBanner?: TopBottomBanner;
}
