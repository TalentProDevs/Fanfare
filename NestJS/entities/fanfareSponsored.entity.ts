/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, raw } from '@nestjs/mongoose';
import { TopBottomBanner } from './topBottomBanner.entity';

@ObjectType()
export class FanfareSponsored {
  @Field((type) => TopBottomBanner, {
    nullable: true,
    description: 'Top/bottom banner object',
  })
  @Prop(raw({ ...TopBottomBanner }))
  bottomBanner?: TopBottomBanner;
}
