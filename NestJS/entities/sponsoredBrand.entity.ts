/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';

@ObjectType()
export class SponsoredBrand {
  @Field(() => String, { nullable: true, description: 'ID for Brand' })
  _id: mongoose.Types.ObjectId;

  @Field(() => String, { nullable: true, description: 'Name for brand' })
  brandName?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Profile Picture for Brand',
  })
  profile_picture?: string;

  //This field has no use, there is no field called brandtag in brand
  @Field(() => String, { nullable: true, description: 'Brand tag' })
  brandtag?: string;

  // @Field(() => String, { nullable: true })
  // profile_pictures?: string;

  //This is for older data that has existing brand hashtag in this
  @Field(() => String, { nullable: true, description: 'Hash Tag' })
  hashtag?: string;

  //Newly stored preferred Hashtags for brand
  @Field(() => [String], { nullable: true, description: 'Preferred Hashtags' })
  preferedHashtags?: string[];

  //Newly stored preferred Brand tags for brand
  @Field(() => [String], {
    nullable: true,
    description: 'Preferred Brand Tags',
  })
  preferedBrandtags?: string[];
}
