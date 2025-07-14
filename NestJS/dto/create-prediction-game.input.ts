import { InputType, Int, Field } from '@nestjs/graphql';
import { SeriesInput } from './admin/series.input';
import { MatchNumberInput } from './admin/matchNumber.input';
import { PredictionType, SponsorType } from '../enums';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { SoloSponsoredInput } from './admin/soloSponsored.input';
import { CoSponsoredInput } from './admin/coSponsored.input';
import { TitleCoSponsoredInput } from './admin/titleCoSponsored.input';
import { PredictionGameQuizInput } from './admin/predictionGameQuiz.input';
import { FanfareSponsoredInput } from './admin/fanfareSponsored.input';
import { GameTypeEnum } from '@/src/live_score_sponsore/enums';

@InputType()
export class CreatePredictionGameInput {
  @Field((type) => SeriesInput, {
    nullable: true,
    description: 'Series Object',
  })
  series?: SeriesInput;

  @Field((type) => [MatchNumberInput], {
    nullable: true,
    description: 'Input for match number',
  })
  matchNumbers?: MatchNumberInput[];

  @Field((type) => PredictionType, {
    nullable: true,
    description: 'Enum for Prediction Type',
  })
  predictionType?: PredictionType;


  
  @Field((type) => String, {
    nullable: true,
    description: 'enum type change into string for creating dynamic prediction type  ',
  })
  predictionTypeV2?: string;
  @Field(() => String, { nullable: true, description: "Prediction type  without white space" })
  predictionTypeWithoutSpace?: string;
  @Field((type) => SponsorType, {
    nullable: true,
    description: 'Sponsorship type',
  })
  sponsorType?: SponsorType;

  @Field((type) => GraphQLUpload, {
    nullable: true,
    description: 'Banner For Prediction Game',
  })
  bannerImage: FileUpload | string;

  @Field((type) => SoloSponsoredInput, {
    nullable: true,
    description: 'Input for solo sponsored',
  })
  soloSponsored?: SoloSponsoredInput;

  @Field((type) => [CoSponsoredInput], {
    nullable: true,
    description: 'Input for Co Sponsored',
  })
  coSponsored?: CoSponsoredInput[];

  @Field((type) => TitleCoSponsoredInput, {
    nullable: true,
    description: 'Input for Title and Co Sponsored',
  })
  titleCoSponsored?: TitleCoSponsoredInput;

  @Field((type) => FanfareSponsoredInput, {
    nullable: true,
    description: 'Input for Fanfare Sponsored',
  })
  fanfareSponsored?: FanfareSponsoredInput;

  @Field(() => Date, { nullable: true, description: 'Start date of game' })
  startDate?: Date;

  @Field(() => Date, { nullable: true, description: 'End date of game' })
  endDate?: Date;

  @Field(() => PredictionGameQuizInput, {
    nullable: true,
    description: 'Input for quiz',
  })
  predictionGameQuiz?: PredictionGameQuizInput;

  @Field(() => Int, {
    nullable: true,
    description: 'F:point for correct prediction',
  })
  predictionPoint?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'F:point for participating in game',
  })
  participationPoint?: number;

  @Field((type) => Boolean, {
    nullable: true,
    description: 'Flag which is updated after predictionPoint is added',
  })
  isPredictionPointAdded?: boolean;

  @Field((type) => Boolean, {
    nullable: true,
    description: 'Flag which is updated after participationPoint is added',
  })
  isParticipationPointAdded?: boolean;

  @Field((type) => String, {
    nullable: true,
    description: 'Message to show after predictionPoint is added',
  })
  messageForPredictionPoint?: string;

  @Field((type) => String, {
    nullable: true,
    description: 'Message to show after participationPoint is added',
  })
  messageForParticipationPoint?: string;

  @Field((type) => String, {
    nullable: true,
    description: 'Prediction Rewards Text',
  })
  predictionRewards?: string;

  @Field((type) => String, {
    nullable: true,
    description: 'Prediction Text',
  })
  predictionText?: string;

  @Field((type) => Boolean, {
    nullable: true,
    description: "Is User's participation is free or not",
  })
  isLocked?: boolean;

  @Field(type => GameTypeEnum,{defaultValue:GameTypeEnum.CRICKET})
  gameType?: GameTypeEnum
}
