import { InputType, Field } from '@nestjs/graphql';
import { GameStatus } from '../../enums/gameStatus.enum';

@InputType()
export class EditGameStatusInput {
    
  @Field(() => String)
  predictionGameId: string;

  @Field(() => GameStatus)
  status: GameStatus;
}
