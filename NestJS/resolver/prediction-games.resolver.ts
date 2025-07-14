/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { PredictionGamesService } from '../service/prediction-games.service';
import { PredictionGame } from '../entities';
import { UseGuards } from '@nestjs/common';
import { Roles } from '@/src/users/decorator/roles.decorator';
import { AbilitiesGuard, JwtAuthGuard, JwtAuthGuardOptional } from '@/src/auth/guard';
import { Role } from '@/src/users/dto/role.enum';
import { CurrentUser, checkAbilities } from '@/src/auth/decorator';
import { CreatePredictionGameInput } from '../dto/create-prediction-game.input';
import {
  PredictionGamesExtraService,
  PredictionGamesPerticipationService,
} from '../service';
import {
  GetPredictionGamesInput,
  PredictionGameInput,
  UserPredictionScoreOutput,
} from '../dto';
import { PredictionType, SeriesIdEnum } from '../enums';
import { UserActivityResponse } from '@/src/user_activities/dto';
import {
  EditGameStatusInput,
  PredictionGameListInput,
  PredictonGameList,
} from '../dto/admin';
import { UpdatePredictionGameInput } from '../dto/update-prediction-game.input';
import { UnsponsoredMatch } from '@/src/live_score_sponsore/dto';
import { getAppVersionFromHeader } from '@/src/util';
import { ActionEnum, ReferenceEnum, SlugEnum } from '@/src/role-permissions/data';
import { abilityToShowPredictionGame } from '../data/check-abilities';

@Resolver(() => PredictionGame)
export class PredictionGamesResolver {
  constructor(
    private readonly predictionGamesService: PredictionGamesService,
    private readonly predictionGamesPerticipationService: PredictionGamesPerticipationService,
    private readonly predictionGamesExtraService: PredictionGamesExtraService,
  ) {}

  @Query((returns) => [PredictionGame])
  @UseGuards(JwtAuthGuardOptional)
  async getPredictionGames(
    @Args({
      name: 'predictionType',
      type: () => PredictionType,
      nullable: true,
    })
    predictionType: PredictionType,
    @Args({
      name: 'getPredictionGamesInput',
      nullable: true,
    })
    getPredictionGamesInput: GetPredictionGamesInput,
    @CurrentUser('userData') userData: any,
  ): Promise<PredictionGame[]> {
    return await this.predictionGamesService.getPredictionGames(
      predictionType,
      userData.id,
      getPredictionGamesInput,
    );
  }

  @Query((returns) => PredictionGame)
  @UseGuards(JwtAuthGuardOptional)
  async getPredictionGameById(
    @Args('predictionGameId') predictionGameId: string,
    @CurrentUser('userData') userData: any,
  ): Promise<PredictionGame> {
    return await this.predictionGamesService.getPredictionGameById(
      predictionGameId,
      userData.id,
    );
  }

  @Mutation((returns) => UserActivityResponse)
  @UseGuards(JwtAuthGuard)
  async perticipatePredictionGame(
    @Args('predictionGameInput') predictionGameInput: PredictionGameInput,
    @CurrentUser('userData') userData: any,
    @Context() context: any,
  ): Promise<UserActivityResponse> {
    const appVersion = getAppVersionFromHeader(context);
    return await this.predictionGamesPerticipationService.perticipatePredictionGame(
      predictionGameInput,
      userData.id,
      appVersion,
    );
  }

  /**
   * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
   */
  // Mutation for creating prediction game from admin

  @Mutation(() => [PredictionGame], { name: 'createPredictionGame' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @UseGuards(AbilitiesGuard)
  @checkAbilities({ action:ActionEnum.CREATE, ref: ReferenceEnum.ADD_SPONSOR, slug:SlugEnum.PREDICTION_GAME })
  async createPredictionGame(
    @Args('createPredictionInput')
    createPredictionInput: CreatePredictionGameInput,
    @CurrentUser('userData') userData: any,
  ) {
    return await this.predictionGamesService.createPredictionGame(
      createPredictionInput,
      userData.id,
    );
  }

  /**
   * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
   */

  // Mutation for updating single prediction game from admin

  @Mutation(() => PredictionGame, { name: 'updatePredictionGame' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @UseGuards(AbilitiesGuard)
  @checkAbilities({ action:ActionEnum.EDIT, ref: ReferenceEnum.PREDICTION_GAME, slug:SlugEnum.PREDICTION_GAME })
  async updatePredictionGame(
    @Args('updatePredictionInput')
    updatePredictionInput: UpdatePredictionGameInput,
    @CurrentUser('userData') userData: any,
  ) {
    return await this.predictionGamesService.updatePredictionGame(
      updatePredictionInput,
      userData.id,
    );
  }

  /**
   * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
   */

  // Query for fetching single prediction game from admin

  @Query(() => PredictionGame)
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async fetchPredictionGameById(
    @Args('_id', { type: () => String }) _id: string,
  ) {
    return await this.predictionGamesService.fetchPredictionGameById(_id);
  }

  ///Admin
  @Query((returns) => PredictonGameList)
  @UseGuards(JwtAuthGuard)
    // @Roles(Role.Admin)
    @UseGuards(AbilitiesGuard)
    @checkAbilities(...abilityToShowPredictionGame)
  async getPredictionGameList(
    @Args('predictionGameListInput')
    predictionGameListInput: PredictionGameListInput,
  ): Promise<PredictonGameList> {
    return await this.predictionGamesExtraService.getPredictionGameList(
      predictionGameListInput,
    );
  }

  @Mutation((returns) => UserActivityResponse)
  @UseGuards(JwtAuthGuard)
   // @Roles(Role.Admin)
   @UseGuards(AbilitiesGuard)
   @checkAbilities({ action:ActionEnum.SELECT_RIGHT_ANSWER, ref: ReferenceEnum.PREDICTION_GAME, slug:SlugEnum.PREDICTION_GAME })
  async selectRightOption(
    @Args('predictionGameInput') predictionGameInput: PredictionGameInput,
    @CurrentUser('userData') userData: any,
  ): Promise<UserActivityResponse> {
    return await this.predictionGamesExtraService.selectRightOption(
      predictionGameInput,
    );
  }

  @Mutation((returns) => UserActivityResponse)
  @UseGuards(JwtAuthGuard)
  @UseGuards(AbilitiesGuard)
  @checkAbilities({ action:ActionEnum.STATUS_CHANGED, ref: ReferenceEnum.PREDICTION_GAME, slug:SlugEnum.PREDICTION_GAME })
  async editPredictionGameStatus(
    @Args('editGameStatusInput') editGameStatusInput: EditGameStatusInput,
    @CurrentUser('userData') userData: any,
  ): Promise<UserActivityResponse> {
    return await this.predictionGamesExtraService.editPredictionGameStatus(
      editGameStatusInput,
      userData.id,
    );
  }

  @Query((returns) => UserPredictionScoreOutput)
  @UseGuards(JwtAuthGuardOptional)
  async predictionScore(): Promise<UserPredictionScoreOutput> {
    return await this.predictionGamesExtraService.predictionScore();
  }

  @Query((returns) => [UnsponsoredMatch])
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  async getAllMatchesForPrediction(
    @Args('seriesId', { type: () => SeriesIdEnum }) seriesId: SeriesIdEnum,
  ): Promise<UnsponsoredMatch[]> {
    return await this.predictionGamesExtraService.getAllMatchesForPrediction(
      seriesId,
    );
  }

  ///Now this is not working after decision of filter then it will continue
  // @Query((returns) => AdminLeaderboardOutput)
  // //@UseGuards(JwtAuthGuard)
  // //@Roles(Role.Admin)
  // async adminLeaderboard(
  // @Args('adminLeaderboardInput') adminLeaderboardInput: AdminLeaderboardInput,
  // ): Promise<AdminLeaderboardOutput> {
  //   return await this.predictionGameLeaderboardService.adminLeaderboard(adminLeaderboardInput)
  // }
}
