
import { Field, InputType } from '@nestjs/graphql';
import { Prop, raw } from '@nestjs/mongoose';
import { TopBottomBannerInput } from './topBottomBanner.input';

@InputType()
export class FanfareSponsoredInput {
  @Field((type) => TopBottomBannerInput, {
    nullable: true,
    description: 'Top and bottom banner object',
  })
  @Prop(raw({ ...TopBottomBannerInput }))
  bottomBanner?: TopBottomBannerInput;
}
