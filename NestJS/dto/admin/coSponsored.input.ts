
import { Field, InputType } from '@nestjs/graphql';
import { SponsoredBrandInput } from './sponsoredBrand.input';

@InputType()
export class CoSponsoredInput {
  @Field((type) => SponsoredBrandInput, {
    nullable: true,
    description: 'Sponsored Brand Object',
  })
  sponsoredBrand?: SponsoredBrandInput;

  @Field((type) => String, { nullable: true, description: 'Destination Link' })
  destinationLink?: string;
}
