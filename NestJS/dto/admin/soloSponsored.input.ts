
import { Field, InputType } from '@nestjs/graphql';
import { SponsoredBrandInput } from './sponsoredBrand.input';
import { TopBottomBannerInput } from './topBottomBanner.input';

@InputType()
export class SoloSponsoredInput {
  @Field((type) => SponsoredBrandInput, {
    nullable: true,
    description: 'Sponsored Brand Object',
  })
  sponsoredBrand?: SponsoredBrandInput;

  @Field((type) => TopBottomBannerInput, {
    nullable: true,
    description: 'Object for top banner',
  })
  topBanner?: TopBottomBannerInput;

  @Field((type) => TopBottomBannerInput, {
    nullable: true,
    description: 'Object for bottom banner',
  })
  bottomBanner?: TopBottomBannerInput;
}
