import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PredictionGame } from '../entities';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PredictionGameInput } from '../dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { FfTransactionServicesSessionBase } from '@/src/transaction/services';
import { CreateTransactionInputDto } from '@/src/transaction/dto';
import {
  EventType,
  FfTransactionCategory,
  FfTransactionType,
} from '@/src/transaction/data';
import { AccountsHeadName } from '@/src/accounts/data';
import { AccountsService } from '@/src/accounts/accounts.service';
import { ObjectId } from 'mongodb';
import { UsersService } from '@/src/users/services';
import { sendNotificationToDevice } from '@/src/util/firebaseNotificaton';
import { BrandExtraService } from '@/src/brand/services';
import { NotificationRoute, NotificationType } from '@/src/notification/data';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserActivityResponse } from '@/src/user_activities/dto';
import { PredictionGameDataService } from '@/src/prediction-game-data/services';
import { createQueryForAddData } from '@/src/util/prediction_game';
@Injectable()
export class PredictionGamesPerticipationService {
  constructor(
    @InjectModel(PredictionGame.name)
    private predictionGameModel: Model<PredictionGame>,
    private FfTransactionServicesSessionBase: FfTransactionServicesSessionBase,
    private accountsService: AccountsService,
    private usersService: UsersService,
    private brandExtraService: BrandExtraService,
    private readonly eventEmitter: EventEmitter2,
    private predictionGameDataService: PredictionGameDataService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async perticipatePredictionGame(
    predictionGameInput: PredictionGameInput,
    userId: string,
    appVersion: string,
  ): Promise<UserActivityResponse> {
    let userInfo: any;
    try {
      const { predictionGameId } = predictionGameInput;

      // This event is emitted to delete the unlock prediction game
      this.eventEmitter.emit('UnlockPredictionsService.deleteUnlockPredictionGame', predictionGameId);

      const predictionEndDate = (
        await this.predictionGameModel.findById(predictionGameId)
      )?.endDate;

      if (predictionEndDate < new Date()) {
        const response = {
          status: false,
          message: 'Sorry this contest has been expired!',
          _id: predictionGameId,
          isFpointAdded: false,
        };
        return response;
      }
      userInfo = await this.usersService.findUserLastLoginDevice(userId);
      const participateDevice = userInfo?.lastLoginDevice?.deviceId;
      const isParticipated =
        await this.predictionGameDataService.isParticipatedPredictionGame(
          userId,
          predictionGameId,
          participateDevice,
        );
      if (isParticipated) {
        const response = {
          status: false,
          message: 'Already Voted From This Device in this Prediction',
          _id: predictionGameId,
          isFpointAdded: false,
        };
        return response;
      }
    } catch (error) {
      throw new NotFoundException('Prediction Game Not Found ' + error);
    }
    const session = await this.connection.startSession();
    let participationPoint: number,
      predictionGameId: string,
      isInserted: any,
      firebaseRegToken: string;
    try {
      session.startTransaction();
      const { optionId } = predictionGameInput;
      predictionGameId = predictionGameInput?.predictionGameId;

      const predictionGameInfo = await this.predictionGameModel.aggregate(
        [
          {
            $match: {
              _id: new ObjectId(predictionGameId),
            },
          },
          {
            $unwind: {
              path: '$predictionGameQuiz.quizOptions',
            },
          },
          {
            $match: {
              'predictionGameQuiz.quizOptions._id': new ObjectId(optionId),
            },
          },
          {
            $project: {
              _id: 1,
              participationPoint: 1,
              match: 1,
              series: 1,
              gameType:1,
              predictionType: 1,
              chosenOptionId: '$predictionGameQuiz.quizOptions._id',
              mainText: '$predictionGameQuiz.quizOptions.mainText',
              subText: '$predictionGameQuiz.quizOptions.subText',
            },
          },
        ],
        { allowDiskUse: true },
      );

      const {
        _id,
        series,
        predictionType,
        match,
        mainText,
        subText,
        chosenOptionId,
        gameType
      } = predictionGameInfo[0];
      participationPoint = predictionGameInfo[0]?.participationPoint;
      const votedDevice = userInfo?.lastLoginDevice;
      const gender = userInfo?.gender;
      const predictionGameData = {
        mainText,
        subText,
        predictionGameId: _id,
        chosenOptionId,
        participatedUserId: new ObjectId(userId),
        votedDevice,
        gender,
        appVersion,
        series,
        gameType
      };
      isInserted =
        await this.predictionGameDataService.createPredictionGameData(
          predictionGameData,
        );
      if (isInserted) {
        firebaseRegToken = (
          await this.usersService.updateTotalPredictionFindUserInfo(userId)
        )?.firebaseRegToken;
        this.eventEmitter.emit(
          'totalPredictionGameParticipationNum.update',
          series,
          userId,
        );
      }
      if (participationPoint > 0 && isInserted) {
        const accountHeadId = (
          await this.accountsService.findAccountByName(
            AccountsHeadName.FPOINT_EARNING_FOR_USER,
          )
        )?._id.toString();

        const createTransactionInputDto: CreateTransactionInputDto = {
          accountHeadId,
          transactionCategory: FfTransactionCategory.F_POINT,
          transactionType: FfTransactionType.IN,
          event: EventType.PERTICIPATION_PREDICTION_GAME,
          amount: participationPoint,
          actionData: JSON.stringify({ _id, series, predictionType, match }),
        };
        await this.FfTransactionServicesSessionBase.createFfTransaction(
          createTransactionInputDto,
          userId,
        );
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new NotFoundException('Prediction Match Not Found ' + error);
    } finally {
      await session.endSession();
      if (!isInserted) {
        const response = {
          status: false,
          message: 'You Already participated in this prediction',
          _id: predictionGameId,
          isFpointAdded: false,
        };
        return response;
      } else if (participationPoint > 0 && isInserted) {
        const gameInfo = {
          userId,
          participationPoint,
          predictionGameId,
        };
        this.sendNotificatonForPerticipatePredictionGame(
          gameInfo,
          firebaseRegToken,
        );
        const response = {
          status: true,
          message: `You won ${participationPoint} F:Points for participation`,
          _id: predictionGameId,
          isFpointAdded: true,
        };
        return response;
      } else {
        const response = {
          status: true,
          message: 'Successfully Participated The Prediction',
          _id: predictionGameId,
          isFpointAdded: false,
        };
        return response;
      }
    }
  }

  async sendNotificatonForPerticipatePredictionGame(
    gameInfo: any,
    firebaseRegToken: string,
  ): Promise<void> {
    try {
      const { userId, participationPoint, predictionGameId } = gameInfo;

      const payload = {
        notification: {
          title: 'Prediction Game',
          body: `You have received ${participationPoint} F:Points for participating in the game.Redeem your F:Points on buying products from Fmart.`,
        },
        data: {},
      };
        sendNotificationToDevice(firebaseRegToken, payload);
        const fanfareBrand = await this.brandExtraService.findBrandByName(
          'Fanfare',
        );

        const ffNotification = {
          userId: new ObjectId(userId),
          dp: fanfareBrand?.profile_picture,
          name: payload.notification.title,
          notificationMessage: payload.notification.body,
          notificationType: NotificationType.TRANSACTION,
          predictionGameId: new ObjectId(predictionGameId),
          route: NotificationRoute.PERTICIPATE_PREDICTION_GAME,
        };

        this.eventEmitter.emit('ffnotification.create', ffNotification);
      
    } catch (error) {
      throw new InternalServerErrorException(
        'Notification cannot send ' + error,
      );
    }
  }

  async addDataToPredictionGameData(seriesId:string):Promise<void>{
    try{
     const aggregateQuery = createQueryForAddData(seriesId)
    await this.predictionGameModel.aggregate(aggregateQuery)
    }catch(error)
    {
      throw new InternalServerErrorException("Cannot Add Data To Prediction Game Data " + error);
      
    }
  }
}
