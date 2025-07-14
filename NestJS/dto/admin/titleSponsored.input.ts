/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, InputType } from '@nestjs/graphql';
import { SponsoredBrandInput } from './sponsoredBrand.input';
import { TopBottomBannerInput } from './topBottomBanner.input';

@InputType()
export class TitleSponsoredInput {
  @Field((type) => SponsoredBrandInput, {
    nullable: true,
    description: 'Input for sponsored brand',
  })
  sponsoredBrand?: SponsoredBrandInput;

  @Field((type) => TopBottomBannerInput, {
    nullable: true,
    description: 'Input for top banner',
  })
  topBanner?: TopBottomBannerInput;
}
