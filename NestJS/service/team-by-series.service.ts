import { Injectable, InternalServerErrorException, NotFoundException, NotImplementedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { TeamBySeries } from "../entities";
import { Model } from "mongoose";
import { CreateTeamBySeriesInput, FindAllTeamsFromAdminInput, UpdateTeamInput } from "../dto/admin";
import { Status } from "@/src/prediction-settings/enum/status.enum";
import { calculateStartAndEndDate, convertToObjectID } from "@/src/util";
import { AwsUploadService } from "@/src/upload/aws.upload.service";
import { FileUpload } from "graphql-upload";


@Injectable()
export class TeamBySeriesService{
    constructor(
        @InjectModel(TeamBySeries.name) 
        private teamBySeriesModel:Model<TeamBySeries>,
        private awsUploadService: AwsUploadService,
    ){}

    async createTeamBySeries(
        createTeamBySeriesInput:CreateTeamBySeriesInput,adminId:string
    ){
        createTeamBySeriesInput.status=Status.ACTIVE
        createTeamBySeriesInput.createdBy=convertToObjectID(adminId)

        let team

        try {
            if (createTeamBySeriesInput.teamLogo.logo) {
                const logoUrl = await this.awsUploadService.uploadFile({
                  file: createTeamBySeriesInput.teamLogo.logo as FileUpload,
                  awsBucketName: process.env.AWS_BUCKET_NAME_FOR_SERIES_TEAM_LOGO,
                });
                createTeamBySeriesInput.teamLogo.logo = logoUrl;
              }

            team= await this.teamBySeriesModel.create(createTeamBySeriesInput)
        } catch (error) {
            throw new NotImplementedException(`Team by Series not created. Details ${error.message}`)
        }

        return team

    }

    async findOneTeamBySeries(
        _id:string
    ){
        let team

        try {
             team=await this.teamBySeriesModel.findById(_id)
        } catch (error) {
            throw new NotFoundException(`Error on finding team`)
        }

        return  team
    }

    async updateTeam(updateTeamInput:UpdateTeamInput,adminId:string){

        let {_id,...restUpdateInput}=updateTeamInput

        let updatedTeam

        restUpdateInput.lastUpdatedBy=convertToObjectID(adminId)

        try {
            if(restUpdateInput?.teamLogo?.logo){
                if (restUpdateInput.teamLogo.logo) {
                    const logoUrl = await this.awsUploadService.uploadFile({
                      file: restUpdateInput.teamLogo.logo as FileUpload,
                      awsBucketName: process.env.AWS_BUCKET_NAME_FOR_SERIES_TEAM_LOGO,
                    });
                    restUpdateInput.teamLogo.logo = logoUrl;
                  }
            }

            updatedTeam= await this.teamBySeriesModel.findByIdAndUpdate(_id,restUpdateInput,{new:true})

            
        } catch (error) {
            throw new InternalServerErrorException(`Update Team failed`+error.message)
        }

        return updatedTeam

    }

    async findActiveTeamsForMobile(){

        let activeTeams

        try {
            activeTeams= await this.teamBySeriesModel.find({status:Status.ACTIVE})
        } catch (error) {
            throw new NotFoundException(`Active teams not found`)
        }
   
        return activeTeams

    }


    async findAllTeamsFromAdmin(findAllTeamsFromAdminInput:FindAllTeamsFromAdminInput){

        const {pageNumber,perPage,isCsv,teamFullName,teamName,status,createdAt,seriesId,gameType}=findAllTeamsFromAdminInput

        const skip=(pageNumber - 1) * perPage
        let query={}

        if(teamFullName){
            query['teamFullName']={
                $regex: teamFullName,
                $options: 'si',
              };
        }

        if(teamName){
            query['teamName']={
                $regex: teamName,
                $options: 'si',
              };
        }
        if(status){
            query['status']=status
        }

        if(seriesId){
            query['series.id']=seriesId
        }
        if(gameType){
            query['gameType']=gameType
        }
        if(createdAt){
            const {startDate,endDate}= createdAt
            const [newStartDate,newEndDate] = calculateStartAndEndDate(startDate, endDate,)
            query['createdAt'] =  {
            $gte: newStartDate,
            $lte: newEndDate
        }
        }

        let totalCount=0,teams

        try {
            teams=await this.teamBySeriesModel.aggregate([
                {
                    $match:query
                },
                {
                    $sort: {_id:-1}
                },
                {
                    $skip:skip
                },
                {
                    $limit:perPage
                },
                {
                    $lookup:{
                        from: "users",
                        as: "createdBy",
                        localField: "createdBy",
                        foreignField: '_id',
                        pipeline:[
                            {
                                $project:{
                                    _id:1,
                                    name:1,
                                    fanfare_id:1,
                                    email:1,
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind:{
                        path:"$createdBy",
                        preserveNullAndEmptyArrays:true
                    }
                },
                {
                    $lookup:{
                        from: "users",
                        as: "lastUpdatedBy",
                        localField: "lastUpdatedBy",
                        foreignField: '_id',
                        pipeline:[
                            {
                                $project:{
                                    _id:1,
                                    name:1,
                                    fanfare_id:1,
                                    email:1,
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind:{
                        path:"$lastUpdatedBy",
                        preserveNullAndEmptyArrays:true
                    }
                }
            ])

            if(!isCsv){
             const totalteams= await this.teamBySeriesModel.aggregate([
                    {
                        $match:query
                    },
                    {
                        $count:"count"
                    }
                ])

                totalCount=totalteams[0]?.count ? totalteams[0]?.count :0
            }
        } catch (error) {
            throw new NotFoundException(` Problem in findAllTeamsFromAdmin`+error.message)
        }

        return {
            teams,
            totalCount
        }
        
    }
}