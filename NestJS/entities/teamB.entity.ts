/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TeamB {
  @Field((type) => String, { nullable: true, description: 'ID of Series' })
  teamName?: string;

  @Field((type) => String, { nullable: true, description: 'Name of Series' })
  teamSurname?: string;

  @Field((type) => Number, { nullable: true, description: 'Team Id' })
  teamId?: number;
}
