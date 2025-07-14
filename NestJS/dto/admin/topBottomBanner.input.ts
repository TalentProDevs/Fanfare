/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class TopBottomBannerInput {
  @Field((type) => GraphQLUpload, {
    nullable: true,
    description: 'Top/Bottom Banner Image',
  })
  bannerImage?: FileUpload | string;

  @Field((type) => String, { nullable: true, description: 'Destination Link' })
  destinationLink?: string;
}
