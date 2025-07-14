/**
 * @author Nuzhat Binte Islam <seuianbinte@gmail.com>
 */

import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { PredictionType, SponsorType } from '../enums';
import { SoloSponsored } from './soloSponsored.entity';
import { CoSponsored } from './coSponsored.entity';
import { PredictionGameQuiz } from './predictionGameQuiz.entity';
import { TitleCoSponsored } from './titleCoSponsored.entity';
import { Series } from './series.entity';
import { MatchNumber } from './matchNumber.entity';
import mongoose, { ObjectId } from 'mongoose';
import { TeamA } from './teamA.entity';
import { TeamB } from './teamB.entity';
import { FanfareSponsored } from './fanfareSponsored.entity';
import { GameStatus } from '../enums/gameStatus.enum';
import { ReachClickImpressionOutput } from '@/src/live_score_sponsore/dto';
import { GameTypeEnum } from '@/src/live_score_sponsore/enums';

export type PredictionGameDocument = PredictionGame & Document;

registerEnumType(PredictionType, {
  name: 'PredictionType',
});

registerEnumType(SponsorType, {
  name: 'SponsorType',
});

registerEnumType(GameStatus, {
  name: 'GameStatus',
});

@ObjectType()
@Schema({ timestamps: true })
export class PredictionGame {
  @Field(() => String, { nullable: true, description: 'Object ID' })
  _id?: mongoose.Types.ObjectId;

  @Field((type) => Series, { nullable: true, description: 'Series Object' })
  @Prop({ type: Series })
  series?: Series;

  @Field((type) => MatchNumber, {
    nullable: true,
    description: 'Match Number object',
  })
  @Prop(raw({ ...MatchNumber }))
  match?: MatchNumber;

  @Field((type) => String, { nullable: true, description: 'Match details' })
  @Prop({ type: String })
  matchDetails?: string;

  @Field((type) => PredictionType, {
    nullable: true,
    description: 'Enum for Prediction Type',
  })
  @Prop({ enum: PredictionType })
  predictionType?: PredictionType;

  @Field((type) => String, {
    nullable: true,
    description: 'enum type change into string for creating dynamic prediction type  ',
  })
  @Prop({ type:String })
  predictionTypeV2?: string;
  @Field(() => String, { nullable: true, description: "Prediction type V2  without white space" })
    @Prop({type:String})
    predictionTypeWithoutSpace?: string;
  @Field((type) => SponsorType, {
    nullable: true,
    description: 'sponsor type enum',
  })
  @Prop({ enum: SponsorType })
  sponsorType?: SponsorType;

  @Field((type) => String, {
    nullable: true,
    description: 'Banner Image',
  })
  @Prop({ type: String })
  bannerImage?: string;

  @Field((type) => SoloSponsored, {
    nullable: true,
    description: 'Solo Sponsored Object',
  })
  @Prop({ type: SoloSponsored })
  soloSponsored?: SoloSponsored;

  @Field((type) => [CoSponsored], {
    nullable: true,
    description: 'Co Sponsored Object',
  })
  @Prop([{ type: CoSponsored }])
  coSponsored?: CoSponsored[];

  @Field((type) => TitleCoSponsored, {
    nullable: true,
    description: 'Title and Co Sponsored',
  })
  @Prop({ type: TitleCoSponsored })
  titleCoSponsored?: TitleCoSponsored;

  @Field((type) => FanfareSponsored, {
    nullable: true,
    description: 'Fanfare Sponsored Object',
  })
  @Prop({ type: FanfareSponsored })
  fanfareSponsored?: FanfareSponsored;

  @Field(() => Date, { nullable: true, description: 'Start date of game' })
  @Prop({ type: Date })
  startDate?: Date;

  @Field(() => Date, { nullable: true, description: 'End date of game' })
  @Prop({ type: Date })
  endDate?: Date;

  @Field(() => PredictionGameQuiz, {
    nullable: true,
    description: 'Quiz Object',
  })
  @Prop({ type: PredictionGameQuiz })
  predictionGameQuiz?: PredictionGameQuiz;

  @Field(() => Int, {
    nullable: true,
    description: 'F:point for correct prediction',
  })
  @Prop({ type: Number })
  predictionPoint?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'F:point for participating in game',
  })
  @Prop({ type: Number ,default:0})
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

  @Field(() => Date, { nullable: true, description: 'Start date of match' })
  @Prop({ type: Date })
  matchStartDate?: Date;

  @Field(() => Date, { nullable: true, description: 'End date of match' })
  @Prop({ type: Date })
  matchEndDate?: Date;

  @Field((type) => TeamA, { nullable: true, description: 'Team A object' })
  @Prop({ type: TeamA })
  teamA?: TeamA;

  @Field((type) => TeamB, { nullable: true, description: 'Team B object' })
  @Prop({ type: TeamB })
  teamB?: TeamB;

  @Field((type) => String, {
    nullable: true,
    description: 'Prediction Rewards Text',
  })
  @Prop({ type: String })
  predictionRewards?: string;

  @Field((type) => String, {
    nullable: true,
    description: 'Message to show before participating the game',
  })
  @Prop({ type: String })
  predictionText?: string;

  @Field((type) => GameStatus, {
    nullable: true,
    description: 'If game is active or not',
  })
  @Prop({ enum: GameStatus, default: GameStatus.ACTIVE })
  gameStatus?: GameStatus;

  @Field((type) => String, {
    nullable: true,
    description: 'Correct Option Id',
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  correctOptionId?: ObjectId;

  @Field((type) => String, { nullable: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  editorAdminUserId?: ObjectId;

  @Field((type) => Date, {
    description: 'Last Update Date',
  })
  updatedAt: Date;

  @Field(type => [ReachClickImpressionOutput],{nullable:true})
  reachImpressionInfo?: ReachClickImpressionOutput[]


  @Field((type) => Boolean, {
    nullable: true,
    description: "Is User's participation is free or not",
  })
  @Prop({ type: Boolean,default:true})
  isLocked?: boolean;
  
  @Field(type => GameTypeEnum,{nullable:true})
  @Prop({type:String, enum:GameTypeEnum,default:GameTypeEnum.CRICKET})
  gameType?: GameTypeEnum
}
export const PredictionGameSchema =
  SchemaFactory.createForClass(PredictionGame);
