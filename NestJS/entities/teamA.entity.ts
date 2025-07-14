/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TeamA {
  @Field((type) => String, { nullable: true, description: 'Team Name' })
  teamName?: string;

  @Field((type) => String, { nullable: true, description: 'Team Surname' })
  teamSurname?: string;

  @Field((type) => Number, { nullable: true, description: 'Team Id' })
  teamId?: number;
}
