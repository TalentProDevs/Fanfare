import { getSeriesData } from '@/src/util/live-score-sponsore';
export async function addMatchInfo(insertArray = []) {
  const length = insertArray.length;
  let seriesData: any;
  seriesData = await getSeriesData();

  const { matchDetails } = seriesData;
  for (let pos = 0; pos < length; pos++) {
    const searchValue = parseInt(insertArray[pos]?.match?.id);

    let matchPos = 0
    const index = matchDetails.findIndex(item => {
      const matchLength = item?.matchDetailsMap?.match.length;
    
      for ( matchPos = 0; matchPos < matchLength; matchPos++) {
        const matchInfo = item?.matchDetailsMap?.match[matchPos]?.matchInfo;
       
        if (matchInfo && matchInfo?.matchId === searchValue) {
          return true;
        }
      }
    
      return false;
    });

    if (index > -1) {
      const { startDate, endDate, team1, team2, venueInfo } =
        matchDetails[index]?.matchDetailsMap?.match[matchPos]?.matchInfo;
      insertArray[pos]['matchStartDate'] = new Date(parseInt(startDate));
      insertArray[pos]['matchEndDate'] = new Date(parseInt(endDate));
      insertArray[pos][
        'matchDetails'
      ] = `${team1?.teamName} vs ${team2?.teamName} * ${venueInfo?.ground}`;

      let teamA = {
        teamName: `${team1?.teamName}`,
        teamSurname: `${team1?.teamSName}`,
        teamId: team1?.teamId,
      };

      let teamB = {
        teamName: `${team2?.teamName}`,
        teamSurname: `${team2?.teamSName}`,
        teamId: team2?.teamId,
      };

      insertArray[pos]['teamA'] = teamA;
      insertArray[pos]['teamB'] = teamB;
    }
  }
}
