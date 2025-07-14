import { Injectable, NotFoundException } from '@nestjs/common';
import { PredictionGame } from '../entities';
import { CreatePredictionGameInput } from '../dto/create-prediction-game.input';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PredictionType, SeriesIdEnum } from '../enums';
import { ObjectId } from 'mongodb';
import { addVotedStatus } from '@/src/util/prediction_game';
import { AwsUploadService } from '@/src/upload/aws.upload.service';
import { BrandService } from '@/src/brand/services/brand.service';
import { FileUpload } from 'graphql-upload';
import { addMatchInfo } from './addMatchInfoForPrediction';
import { GameStatus } from '../enums/gameStatus.enum';
import { UpdatePredictionGameInput } from '../dto/update-prediction-game.input';
import {
  removeNullFormObjProp,
  skipLimitForZeroIndexBasePagination,
} from '@/src/util';
import { GetPredictionGamesInput } from '../dto';
import { checkProperPaginationDataZeroIndexBase } from '@/src/util/checkProperPaginationData';
import { ACTIVE_SERIES_ID } from '@/src/consts'

@Injectable()
export class PredictionGamesService {
  constructor(
    @InjectModel(PredictionGame.name)
    private predictionGameModel: Model<PredictionGame>,
    private awsUploadService: AwsUploadService,
    private brandService: BrandService,
  ) {}
  //for mobile api
  async getPredictionGames(
    predictionType: PredictionType,
    userId: string,
    getPredictionGamesInput: GetPredictionGamesInput,
  ): Promise<PredictionGame[]> {
    try {
      let { startIndex, endIndex } = getPredictionGamesInput;
      if (!startIndex && !endIndex) {
        startIndex = 0;
        endIndex = 40;
      }
      checkProperPaginationDataZeroIndexBase(startIndex, endIndex);
      const [skip, limit] = skipLimitForZeroIndexBasePagination(
        startIndex,
        endIndex,
      );


      const matchObj = {};
      if (predictionType) {
        matchObj['predictionType'] = predictionType;
      }
      matchObj['$or'] = [{startDate:{$lte:new Date()}},{startDate:null}]
      matchObj['series.id'] = ACTIVE_SERIES_ID;
      matchObj['gameStatus'] = GameStatus.ACTIVE;

      const allPredictionGames = await this.predictionGameModel.aggregate(
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
            $limit: limit,
          },
          {
            $lookup: {
              from: 'predictionGameData',
              localField: '_id',
              foreignField: 'predictionGameId',
              pipeline: [
                {
                  $match: {
                    participatedUserId: new ObjectId(userId),
                  },
                },
              ],
              as: 'result',
            },
          },
          {
            $unwind: {
              path: '$result',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              'predictionGameQuiz.quizOptions': {
                $map: {
                  input: '$predictionGameQuiz.quizOptions',
                  as: 'option',
                  in: {
                    $mergeObjects: [
                      '$$option',
                      {
                        isVoted: {
                          $cond: {
                            if: {
                              $eq: ['$$option._id', '$result.chosenOptionId'],
                            },
                            then: true,
                            else: false,
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            $project: {
              result: 0,
            },
          },
        ],
        { allowDiskUse: true },
      );
      return allPredictionGames;
    } catch (error) {
      throw new NotFoundException('Prediction Match Not Found ' + error);
    }
  }

  async getPredictionGameById(
    predictionGameId: string,
    userId: string,
  ): Promise<PredictionGame> {
    try {
      const predictionGame = await this.predictionGameModel.findById(
        predictionGameId,
      );

      const isPerticipated = await this.predictionGameModel.exists({
        'predictionGameQuiz.quizOptions.vote.votedUser': new ObjectId(userId),
        _id: new ObjectId(predictionGameId),
      });

      if (isPerticipated) {
        addVotedStatus(predictionGame, userId);
      }
      return predictionGame;
    } catch (error) {
      throw new NotFoundException('Prediction Game Not Found ' + error);
    }
  }


  async createPredictionGame(
    createPredictionInput: CreatePredictionGameInput,
    adminUserId: string,
  ) {

    createPredictionInput.startDate.setSeconds(0, 0) //TO MADE THE SECOND AND MILISECOND ZERO.
    createPredictionInput.endDate.setSeconds(0, 0) //TO MADE THE SECOND AND MILISECOND ZERO.

    let insertArray = [];
    removeNullFormObjProp(createPredictionInput);
    //Uploading Banner
    try {
      if (createPredictionInput['bannerImage']) {
        if (createPredictionInput['bannerImage'] !== undefined) {
          let bannerImageUrl = await this.awsUploadService.uploadFile({
            file: createPredictionInput.bannerImage as FileUpload,
            awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
          });

          if (bannerImageUrl == null || bannerImageUrl == undefined) {
            createPredictionInput.bannerImage = '';
          } else {
            createPredictionInput.bannerImage = bannerImageUrl;
          }
        }
      }
    } catch (error) {
      throw new NotFoundException(
        `Error while uploading Banner  Image, possible reason -  ${error}`,
      );
    }

    //Uploading Options Image
    if (createPredictionInput?.predictionGameQuiz?.quizOptions?.length > 0) {
      for (
        let i = 0;
        i < createPredictionInput?.predictionGameQuiz?.quizOptions?.length;
        i++
      ) {
        try {
          if (
            createPredictionInput?.predictionGameQuiz?.quizOptions[i]
              ?.optionImage
          ) {
            if (
              createPredictionInput?.predictionGameQuiz?.quizOptions[i]
                ?.optionImage !== undefined
            ) {
              createPredictionInput.predictionGameQuiz.quizOptions[
                i
              ].optionImage = await this.awsUploadService.uploadFile({
                file: createPredictionInput.predictionGameQuiz.quizOptions[i]
                  .optionImage as FileUpload,
                awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
              });
            }
          }
        } catch (error) {
          throw new NotFoundException(
            `Error while uploading option image, Reason -  ${error}`,
          );
        }
      }
    }

    if (createPredictionInput.matchNumbers) {
      const copiedMatchNumber = [...createPredictionInput.matchNumbers];
      delete createPredictionInput?.matchNumbers;
      const length = copiedMatchNumber.length;
      for (let i = 0; i < length; i++) {
        const { id, number } = copiedMatchNumber[i];
        createPredictionInput['match'] = {
          id,
          number,
        };
        insertArray.push({ ...createPredictionInput });
      }
    }

    //Solo Sponsor
    if (createPredictionInput?.soloSponsored) {
      const { sponsoredBrand } = createPredictionInput?.soloSponsored;

      const brandObject = await this.brandService.findBrandById(
        sponsoredBrand?._id,
      );

      createPredictionInput.soloSponsored.sponsoredBrand._id = brandObject?._id;
      createPredictionInput.soloSponsored.sponsoredBrand.brandName =
        brandObject?.name;
      createPredictionInput.soloSponsored.sponsoredBrand.profile_picture =
        brandObject?.profile_picture;

      if (createPredictionInput.soloSponsored.topBanner['bannerImage']) {
        try {
          if (
            createPredictionInput.soloSponsored.topBanner['bannerImage'] !==
            undefined
          ) {
            let bannerImageUrl = await this.awsUploadService.uploadFile({
              file: createPredictionInput.soloSponsored.topBanner[
                'bannerImage'
              ] as FileUpload,
              awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
            });

            if (bannerImageUrl == null || bannerImageUrl == undefined) {
              createPredictionInput.soloSponsored.topBanner.bannerImage = '';
            } else {
              createPredictionInput.soloSponsored.topBanner.bannerImage =
                bannerImageUrl;
            }
          }
        } catch (error) {
          throw new NotFoundException(
            `Error while uploading Banner  Image, possible reason -  ${error}`,
          );
        }
      }

      if (createPredictionInput.soloSponsored.bottomBanner['bannerImage']) {
        try {
          if (
            createPredictionInput.soloSponsored.bottomBanner['bannerImage'] !==
            undefined
          ) {
            let bannerImageUrl = await this.awsUploadService.uploadFile({
              file: createPredictionInput.soloSponsored.bottomBanner[
                'bannerImage'
              ] as FileUpload,
              awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
            });

            if (bannerImageUrl == null || bannerImageUrl == undefined) {
              createPredictionInput.soloSponsored.bottomBanner.bannerImage = '';
            } else {
              createPredictionInput.soloSponsored.bottomBanner.bannerImage =
                bannerImageUrl;
            }
          }
        } catch (error) {
          throw new NotFoundException(
            `Error while uploading Banner  Image, possible reason -  ${error}`,
          );
        }
      }
    }

    //Co Sponsor
    if (createPredictionInput?.coSponsored) {
      const length = createPredictionInput.coSponsored.length;

      for (let i = 0; i < length; i++) {
        const { sponsoredBrand } = createPredictionInput.coSponsored[i];

        const brandObject = await this.brandService.findBrandById(
          sponsoredBrand?._id,
        );

        createPredictionInput.coSponsored[i].sponsoredBrand._id =
          brandObject?._id;
        createPredictionInput.coSponsored[i].sponsoredBrand.brandName =
          brandObject?.name;
        createPredictionInput.coSponsored[i].sponsoredBrand.profile_picture =
          brandObject?.profile_picture;
      }
    }

    //Title and Co Both Sponsor
    if (createPredictionInput.titleCoSponsored) {
      //uploading banner image
      if (createPredictionInput.titleCoSponsored.topBanner['bannerImage']) {
        try {
          if (
            createPredictionInput.titleCoSponsored.topBanner['bannerImage'] !==
            undefined
          ) {
            let bannerImageUrl = await this.awsUploadService.uploadFile({
              file: createPredictionInput.titleCoSponsored.topBanner[
                'bannerImage'
              ] as FileUpload,
              awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
            });

            if (bannerImageUrl == null || bannerImageUrl == undefined) {
              createPredictionInput.titleCoSponsored.topBanner.bannerImage = '';
            } else {
              createPredictionInput.titleCoSponsored.topBanner.bannerImage =
                bannerImageUrl;
            }
          }
        } catch (error) {
          throw new NotFoundException(
            `Error while uploading Banner  Image, possible reason -  ${error}`,
          );
        }
      }

      const brandObject = await this.brandService.findBrandById(
        createPredictionInput.titleCoSponsored.sponsoredBrand._id,
      );

      createPredictionInput.titleCoSponsored.sponsoredBrand._id =
        brandObject?._id;
      createPredictionInput.titleCoSponsored.sponsoredBrand.brandName =
        brandObject?.name;
      createPredictionInput.titleCoSponsored.sponsoredBrand.profile_picture =
        brandObject?.profile_picture;
    }

    //Fanfare sponsor
    if (createPredictionInput.fanfareSponsored) {
      //uploading banner image
      if (createPredictionInput.fanfareSponsored.bottomBanner['bannerImage']) {
        try {
          if (
            createPredictionInput.fanfareSponsored.bottomBanner[
              'bannerImage'
            ] !== undefined
          ) {
            let bannerImageUrl = await this.awsUploadService.uploadFile({
              file: createPredictionInput.fanfareSponsored.bottomBanner[
                'bannerImage'
              ] as FileUpload,
              awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
            });

            if (bannerImageUrl == null || bannerImageUrl == undefined) {
              createPredictionInput.fanfareSponsored.bottomBanner.bannerImage =
                '';
            } else {
              createPredictionInput.fanfareSponsored.bottomBanner.bannerImage =
                bannerImageUrl;
            }
          }
        } catch (error) {
          throw new NotFoundException(
            `Error while uploading Banner  Image, possible reason -  ${error}`,
          );
        }
      }
    }

    await addMatchInfo(insertArray);

    const createdGame = await this.predictionGameModel.create(insertArray);

    return createdGame;
  }

 
  async updatePredictionGame(
    updatePredictionInput: UpdatePredictionGameInput,
    adminUserId: string,
  ) {
    const {isLocked} = updatePredictionInput;
    try {
      const payload = {};

      //Update Banner Image
      try {
        let image;

        if (updatePredictionInput?.bannerImage) {
          if (updatePredictionInput['bannerImage'] !== undefined) {
            image = await this.awsUploadService.uploadFile({
              file: updatePredictionInput['bannerImage'] as FileUpload,
              awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
            });
          }

          if (image == null || image == undefined) {
            payload['bannerImage'] = '';
          } else {
            payload['bannerImage'] = image;
          }
        }
      } catch (error) {
        throw new NotFoundException(
          `Error while updating banner image, Reason -  ${error}`,
        );
      }

      if (updatePredictionInput.sponsorType == 'soloSponsored') {
        //Update Top Banner
        try {
          let image;

          if (updatePredictionInput?.soloSponsored?.topBanner?.bannerImage) {
            if (
              updatePredictionInput?.soloSponsored?.topBanner?.bannerImage !==
              undefined
            ) {
              image = await this.awsUploadService.uploadFile({
                file: updatePredictionInput?.soloSponsored?.topBanner
                  ?.bannerImage as FileUpload,
                awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
              });
            }

            if (image == null || image == undefined) {
              payload['soloSponsored.topBanner.bannerImage'] = '';
            } else {
              payload['soloSponsored.topBanner.bannerImage'] = image;
            }
          }
        } catch (error) {
          throw new NotFoundException(
            `Error while updating top banner, Reason -  ${error}`,
          );
        }

        //Update destination link for top banner
        if (updatePredictionInput?.soloSponsored?.topBanner?.destinationLink) {
          payload['soloSponsored.topBanner.destinationLink'] =
            updatePredictionInput?.soloSponsored?.topBanner?.destinationLink;
        }

        //Update Bottom Banner
        try {
          let image;
          if (updatePredictionInput?.soloSponsored?.bottomBanner?.bannerImage) {
            if (
              updatePredictionInput?.soloSponsored?.bottomBanner
                ?.bannerImage !== undefined
            ) {
              image = await this.awsUploadService.uploadFile({
                file: updatePredictionInput?.soloSponsored?.bottomBanner
                  ?.bannerImage as FileUpload,
                awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
              });
            }

            if (image == null || image == undefined) {
              payload['soloSponsored.bottomBanner.bannerImage'] = '';
            } else {
              payload['soloSponsored.bottomBanner.bannerImage'] = image;
            }
          }
        } catch (error) {
          throw new NotFoundException(
            `Error while updating bottom banner, Reason -  ${error}`,
          );
        }

        //Update destination link for bottom banner
        if (
          updatePredictionInput?.soloSponsored?.bottomBanner?.destinationLink
        ) {
          payload['soloSponsored.bottomBanner.destinationLink'] =
            updatePredictionInput?.soloSponsored?.bottomBanner?.destinationLink;
        }
      }

      if (
        updatePredictionInput.sponsorType == 'coSponsored' ||
        updatePredictionInput.sponsorType == 'titleAndCoSponsored'
      ) {
        let existing;
        existing = await this.predictionGameModel.find(
          { _id: updatePredictionInput._id },
          {
            coSponsored: 1,
          },
        );

        for (let i = 0; i < existing[0]?.coSponsored?.length; i++) {
          const _id =
            updatePredictionInput?.coSponsored[i]?.sponsoredBrand?._id;

          const brandObject = await this.brandService.findBrandById(
            _id.toString(),
          );

          existing[0].coSponsored[i].sponsoredBrand._id = brandObject?._id;
          existing[0].coSponsored[i].sponsoredBrand.brandName =
            brandObject?.name;
          existing[0].coSponsored[i].sponsoredBrand.profile_picture =
            brandObject?.profile_picture;

          existing[0].coSponsored[i].destinationLink =
            updatePredictionInput?.coSponsored[i]?.destinationLink;
        }

        payload['coSponsored'] = existing[0]?.coSponsored;
      }

      if (updatePredictionInput.sponsorType == 'titleAndCoSponsored') {
        let existing;

        existing = await this.predictionGameModel.find(
          { _id: updatePredictionInput._id },
          {
            titleCoSponsored: 1,
          },
        );

        const _id =
          updatePredictionInput?.titleCoSponsored?.sponsoredBrand?._id;

        const brandObject = await this.brandService.findBrandById(
          _id.toString(),
        );

        existing[0].titleCoSponsored.sponsoredBrand._id = brandObject?._id;
        existing[0].titleCoSponsored.sponsoredBrand.brandName =
          brandObject?.name;
        existing[0].titleCoSponsored.sponsoredBrand.profile_picture =
          brandObject?.profile_picture;

        payload['titleCoSponsored.sponsoredBrand'] =
          existing[0].titleCoSponsored.sponsoredBrand;

        //Update Top Banner
        try {
          let image;

          if (updatePredictionInput?.titleCoSponsored?.topBanner?.bannerImage) {
            if (
              updatePredictionInput?.titleCoSponsored?.topBanner
                ?.bannerImage !== undefined
            ) {
              image = await this.awsUploadService.uploadFile({
                file: updatePredictionInput?.titleCoSponsored?.topBanner
                  ?.bannerImage as FileUpload,
                awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
              });
            }

            if (image == null || image == undefined) {
              payload['titleCoSponsored.topBanner.bannerImage'] = '';
            } else {
              payload['titleCoSponsored.topBanner.bannerImage'] = image;
            }
          }
        } catch (error) {
          throw new NotFoundException(
            `Error while updating top banner, Reason -  ${error}`,
          );
        }

        //Update destination link for top banner
        if (
          updatePredictionInput?.titleCoSponsored?.topBanner?.destinationLink
        ) {
          payload['titleCoSponsored.topBanner.destinationLink'] =
            updatePredictionInput?.titleCoSponsored?.topBanner?.destinationLink;
        }
      }

      if (updatePredictionInput.sponsorType == 'fanfareSponsored') {
        //Update Bottom Banner
        try {
          let image;
          if (
            updatePredictionInput?.fanfareSponsored?.bottomBanner?.bannerImage
          ) {
            if (
              updatePredictionInput?.fanfareSponsored?.bottomBanner
                ?.bannerImage !== undefined
            ) {
              image = await this.awsUploadService.uploadFile({
                file: updatePredictionInput?.fanfareSponsored?.bottomBanner
                  ?.bannerImage as FileUpload,
                awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
              });
            }

            if (image == null || image == undefined) {
              payload['fanfareSponsored.bottomBanner.bannerImage'] = '';
            } else {
              payload['fanfareSponsored.bottomBanner.bannerImage'] = image;
            }
          }
        } catch (error) {
          throw new NotFoundException(
            `Error while updating bottom banner, Reason -  ${error}`,
          );
        }

        //Update destination link for bottom banner
        if (
          updatePredictionInput?.fanfareSponsored?.bottomBanner?.destinationLink
        ) {
          payload['fanfareSponsored.bottomBanner.destinationLink'] =
            updatePredictionInput?.fanfareSponsored?.bottomBanner?.destinationLink;
        }
      }

      //updating prediction f:point
      if (updatePredictionInput.predictionPoint) {
        payload['predictionPoint'] = updatePredictionInput.predictionPoint;
      }

      //Updating text
      if (updatePredictionInput?.predictionRewards) {
        payload['predictionRewards'] = updatePredictionInput?.predictionRewards;
      }

      //Updating text
      if (updatePredictionInput?.predictionText) {
        payload['predictionText'] = updatePredictionInput?.predictionText;
      }

      //updating participation f:point
      if (updatePredictionInput.participationPoint) {
        payload['participationPoint'] =
          updatePredictionInput.participationPoint;
      }

      if (updatePredictionInput.startDate) {
        payload['startDate'] = updatePredictionInput.startDate;
      }

      if (updatePredictionInput.endDate) {
        payload['endDate'] = updatePredictionInput.endDate;
      }

      if (updatePredictionInput?.predictionGameQuiz?.question) {
        payload['predictionGameQuiz.question'] =
          updatePredictionInput.predictionGameQuiz.question;
      }

      if (updatePredictionInput?.predictionGameQuiz?.totalOptions) {
        payload['predictionGameQuiz.totalOptions'] =
          updatePredictionInput?.predictionGameQuiz?.totalOptions;
      }

      if (updatePredictionInput?.predictionGameQuiz?.quizOptions) {
        let imgArray = [];

        //Updating Options Image
        for (
          let i = 0;
          i < updatePredictionInput?.predictionGameQuiz?.quizOptions?.length;
          i++
        ) {
          try {
            if (
              updatePredictionInput?.predictionGameQuiz?.quizOptions[i]
                ?.optionImage
            ) {
              let url = await this.awsUploadService.uploadFile({
                file: updatePredictionInput?.predictionGameQuiz?.quizOptions[i]
                  ?.optionImage as FileUpload,
                awsBucketName: process.env.AWS_BUCKET_NAME_FOR_COVER_IMAGES,
              });

              if (url !== null || url !== undefined) {
                let obj = {};

                obj[i] = i;
                obj['url'] = url;

                imgArray.push(obj);
              } else {
                let obj = {};

                obj[i] = i;
                obj['url'] = null;

                imgArray.push(obj);
              }
            } else {
              let obj = {};

              obj[i] = i;
              obj['url'] = null;

              imgArray.push(obj);
            }
          } catch (error) {
            throw new NotFoundException(
              `Error while updating options image, Reason -  ${error}`,
            );
          }
        }

        let existing = await this.predictionGameModel.find(
          { _id: updatePredictionInput._id },
          {
            'predictionGameQuiz.quizOptions': 1,
          },
        );

        let oldOptions = existing[0]?.predictionGameQuiz?.quizOptions;

        oldOptions.map((each, index) => {
          each.mainText =
            updatePredictionInput?.predictionGameQuiz?.quizOptions[
              index
            ]?.mainText;

          each.subText =
            updatePredictionInput?.predictionGameQuiz?.quizOptions[
              index
            ]?.subText;

          if (imgArray[index]?.url == null) {
            each.optionImage = each.optionImage;
          } else {
            each.optionImage = imgArray[index]?.url;
          }
        });

        payload['predictionGameQuiz.quizOptions'] = oldOptions;
      }
       
     if(isLocked !== undefined){
      payload['isLocked'] = isLocked;
     }
      
      const updatedGame = await this.predictionGameModel.findByIdAndUpdate(
        updatePredictionInput._id,
        payload,
        { new: true },
      );

      return updatedGame;
    } catch (error) {
      throw new NotFoundException(
        `Could not update prediction game, Reason -  ${error}`,
      );
    }
  }

  //Service for fetching single prediction game

  async fetchPredictionGameById(_id: string) {
    const fetchedGame = await this.predictionGameModel.findById(_id);

    return fetchedGame;
  }
}
