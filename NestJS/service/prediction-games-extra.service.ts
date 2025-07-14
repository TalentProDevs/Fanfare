import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PredictionGame } from '../entities';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EditGameStatusInput, PredictionGameListInput, PredictonGameList } from '../dto/admin';
import { createMatchObjForGameList } from '@/src/util/prediction_game';
import { PredictionGameInput, UserPredictionScoreOutput } from '../dto';
import { ObjectId } from 'mongodb';
import { UserActivityResponse } from '@/src/user_activities/dto';
import { PredictionScore, SeriesIdEnum } from '../enums';
import { PredictionGameDataService } from '@/src/prediction-game-data/services';
import { UnsponsoredMatch } from '@/src/live_score_sponsore/dto';

@Injectable()
export class PredictionGamesExtraService {
  constructor(
    @InjectModel(PredictionGame.name)
    private predictionGameModel: Model<PredictionGame>,
    private predictionGameDataService:PredictionGameDataService
  ) {}

  async getPredictionGameList(
    predictionGameListInput: PredictionGameListInput,
  ): Promise<PredictonGameList> {
    try {
      const { perPage, pageNumber, isCsv } = predictionGameListInput;
      const matchObj = createMatchObjForGameList(predictionGameListInput);
     
      const skip = (pageNumber - 1) * perPage;
      const predictionGameList = await this.predictionGameModel.aggregate(
        [
          {
            $match: matchObj,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: perPage,
          },
          {
            $lookup: {
              from: 'predictionGameData',
              localField: '_id',
              foreignField: 'predictionGameId',
              as: 'voteInfo',
            },
          },
          {
            $addFields: {
              'predictionGameQuiz.totalVote': { $size: '$voteInfo' },
              predictionId: { $toString: '$_id' },
            },
          },
          {
            $lookup: {
              from: 'reachimpressions',
              localField: 'predictionId',
              foreignField: 'id',
              pipeline: [
                {
                  $group: {
                    _id: {
                      type: '$type',
                      brandId: '$brandID',
                    },
                    reach: { $sum: '$reach' },
                    impression: { $sum: '$impression' },
                    click: { $sum: '$click' },
                    clickedDevices: {
                      $addToSet: {
                        $cond: [
                          {
                            $gt: ['$click', 0],
                          },
                          '$deviceID',
                          '$$REMOVE',
                        ],
                      },
                    },
                  },
                },
                {
                  $project: {
                    type: '$_id.type',
                    brandId: '$_id.brandId',
                    reach: '$reach',
                    click: '$click',
                    impression: '$impression',
                    uniqueClick: {
                      $size: {
                        $ifNull: ['$clickedDevices', []],
                      },
                    },
                    _id: 0,
                  },
                },
              ],
              as: 'reachImpressionInfo',
            },
          },
        ],
        { allowDiskUse: true },
      );
      let count = 0;
      if (!isCsv) {
        let totalCount = await this.predictionGameModel.aggregate([{
          $match: matchObj,
        },
      {
        $count:"count"
      }
      ])
      if(totalCount[0]?.count)
      {
        count = totalCount[0]?.count
      }
      }

      let result = {
        predictionGameList,
        totalGames: count,
      };

      
      return result;
    } catch (error) {
      throw new NotFoundException('Prediction Game List Not Found' + error);
    }
  }

  async selectRightOption(
    predictionGameInput: PredictionGameInput,
  ): Promise<UserActivityResponse> {
    try {
      const { predictionGameId, optionId } = predictionGameInput;
      const isGivenAns = await this.predictionGameModel.exists({
        'predictionGameQuiz.quizOptions.isCorrect':true,
        _id:new ObjectId(predictionGameId)
      })
      
      if(isGivenAns)
      {
        throw new BadRequestException('Already Given Correct Answer');
      }
    const isUpdated = await this.predictionGameModel.findOneAndUpdate(
        {
          _id: new ObjectId(predictionGameId),
          'predictionGameQuiz.quizOptions._id': new ObjectId(optionId),
        },
        {
          'predictionGameQuiz.quizOptions.$.isCorrect': true,
          correctOptionId: new ObjectId(optionId),
        },
      );

    let response =  {}
    if(isUpdated){
      const {series} = isUpdated
     // this.predictionGameDataService.givePredictionPointToUsers(predictionGameInput);
      this.predictionGameDataService.givePredictionPointToUsersCombine(predictionGameInput,series?.id)

       response = {
        status: true,
        _id: predictionGameId,
        message: 'Successfully Added Correct Answer',
      }
  }

    else {
      response = {
        status: false,
        _id: predictionGameId,
        message: 'PredictionId Or OptionId is not correct',
      }
    }
    
   return response;
    } catch (error) {
      throw new NotFoundException('Prediction Game Not Found' + error);
    }
  }

  async editPredictionGameStatus(
    editGameStatusInput: EditGameStatusInput,
    adminUserId: string,
  ): Promise<UserActivityResponse> {
    try {
      const { predictionGameId, status } = editGameStatusInput;

      await this.predictionGameModel.findByIdAndUpdate(predictionGameId, {
        gameStatus: status,
        editorAdminUserId: new ObjectId(adminUserId),
      });

      const response = {
        status: true,
        _id: predictionGameId,
        message: 'Successfully Change Prediction Game Status',
      };

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        'Prediction Game Status Cannot Updated' + error,
      );
    }
  }

  async predictionScore(): Promise<UserPredictionScoreOutput> {
    try {

  const predictionScore = {
    wicketPrediction:PredictionScore.WICKET_PREDICTION,
    manOfTheMatch:PredictionScore.MAN_OF_THE_MATCH,
    scorePrediction:PredictionScore.SCORE_PREDICTION,
    matchPrediction:PredictionScore.MATCH_PREDICTION
  }


  return predictionScore;
    } catch (error) {
      throw new InternalServerErrorException(
        'Prediction Game Status Cannot Updated' + error,
      );
    }
  }

  async getAllMatchesForPrediction(seriesId:SeriesIdEnum): Promise<UnsponsoredMatch[]> {
    try {
      const allMatches = await this.predictionGameModel.aggregate([
        {
          $match: {
            'series.id':seriesId
          }
        },
        {
          $group: {
            _id: "$match",
          },
        },
        {
          $addFields: {
            matchNumObj: {
              $regexFind: {
                input: "$_id.number",
                regex: "[0-9]+",
              },
            },
          },
        },
        {
          $sort: {
            'matchNumObj.match': 1
          }
        },
        {
          $project: {
            id: "$_id.id",
            number: "$_id.number",
            _id: 0,
          },
        }
      ]);

      return allMatches;
    } catch (error) {
      throw new NotFoundException('Prediction Match Not Found' + error);
    }
  }
}
