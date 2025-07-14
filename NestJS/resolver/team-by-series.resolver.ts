import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TeamBySeries } from "../entities";
import { TeamBySeriesService } from "../service";
import { JwtAuthGuard } from "@/src/auth/guard";
import { UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/src/auth/decorator";
import { CreateTeamBySeriesInput, FindAllTeamsFromAdminInput, FindAllTeamsFromAdminResponse, UpdateTeamInput } from "../dto/admin";
import { Roles } from "@/src/users/decorator/roles.decorator";
import { Role } from "@/src/users/dto/role.enum";


@Resolver(()=>TeamBySeries)
export class TeamBySeriesResolver{
    constructor(
        private teamBySeriesService : TeamBySeriesService
    ){}

    @Mutation((returns) => TeamBySeries)
    @Roles(Role.Admin)
    @UseGuards(JwtAuthGuard)
    async createTeamBySeries(
      @Args('createTeamBySeriesInput') createTeamBySeriesInput: CreateTeamBySeriesInput,
      @CurrentUser('userData') userData: any,
    ) {
      return await this.teamBySeriesService.createTeamBySeries(createTeamBySeriesInput,userData.id)
    }

    @Mutation((returns) => TeamBySeries)
    @Roles(Role.Admin)
    @UseGuards(JwtAuthGuard)
    async updateTeamBySeries(
      @Args('updateTeamInput') updateTeamInput: UpdateTeamInput,
      @CurrentUser('userData') userData: any,
    ) {
      return await this.teamBySeriesService.updateTeam(updateTeamInput,userData.id)
    }

    @Query((returns) => [TeamBySeries])
    async findActiveTeamsForMobile() {
      return await this.teamBySeriesService.findActiveTeamsForMobile()
    }

    @Query((returns) => FindAllTeamsFromAdminResponse)
    @Roles(Role.Admin)
    @UseGuards(JwtAuthGuard)
    async findAllTeamsFromAdmin(
        @Args('findAllTeamsFromAdmin') findAllTeamsFromAdminInput:FindAllTeamsFromAdminInput
    ) {
      return await this.teamBySeriesService.findAllTeamsFromAdmin(findAllTeamsFromAdminInput)
    }
}