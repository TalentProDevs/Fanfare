
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SponsoredBrandInput {
  @Field(() => String, { nullable: true, description: 'ID for Brand' })
  _id: string;

  @Field(() => String, { nullable: true, description: 'Name for brand' })
  brandName?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Profile picture for brand',
  })
  profile_picture?: string;
}
