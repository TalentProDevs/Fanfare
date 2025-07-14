import { PaginationIndexBase } from '@/src/dto/mobile-dto';
import {InputType } from '@nestjs/graphql';

@InputType()
export class GetPredictionGamesInput extends PaginationIndexBase{
    
}
