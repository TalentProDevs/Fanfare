import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadModule } from '../upload/upload.module';
import { BrandModule } from '../brand/brand.module';
import {
  PredictionGame,
  PredictionGameSchema,
} from './entities/predictionGame.entity';
import { PredictionGamesResolver } from './resolver/prediction-games.resolver';
import { PredictionGamesService } from './service/prediction-games.service';
import { FfTransactionModule } from '../transaction/transaction.module';
import { AccountsModule } from '../accounts/accounts.module';
import { PredictionGamesExtraService, PredictionGamesPerticipationService, TeamBySeriesService } from './service';
import { UsersModule } from '../users/users.module';
import { PredictionGameDataModule } from '../prediction-game-data/prediction-game-data.module';
import { TeamBySeriesResolver } from './resolver';
import { TeamBySeries, TeamBySeriesSchema } from './entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PredictionGame.name, schema: PredictionGameSchema },
      { name: TeamBySeries.name, schema: TeamBySeriesSchema },
    ]),
    UploadModule,
    BrandModule,
    FfTransactionModule,
    AccountsModule,
    UsersModule,
    PredictionGameDataModule
  ],
  providers: [
    PredictionGamesResolver, 
    PredictionGamesService,
    PredictionGamesPerticipationService,
    PredictionGamesExtraService,
    TeamBySeriesService,
    TeamBySeriesResolver
  ],
  exports:[
    PredictionGamesPerticipationService
  ]
})
export class PredictionGamesModule {}
