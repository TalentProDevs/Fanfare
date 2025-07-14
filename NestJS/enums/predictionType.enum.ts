
import { registerEnumType } from "@nestjs/graphql";

export enum PredictionType {
  MATCH_PREDICTION = 'matchPrediction',
  SCORE_PREDICTION = 'scorePrediction',
  MAN_OF_THE_MATCH = 'manOfTheMatch',
  WICKET_PREDICTION = 'wicketPrediction',
  TOSS_PREDICTION = "tossPrediction",
  BATTING_PREDICTION = "battingPrediction",
  RAPID_PREDICTION = 'rapidPrediction'
}

registerEnumType(PredictionType, {
  name: 'predictionType',
});