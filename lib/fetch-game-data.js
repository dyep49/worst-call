import leftPad from 'left-pad';
import xmlParser from 'xml2json';
import Promise from 'bluebird';
const request = Promise.promisify(require('request'));

function xmlResponseToJSON(response) {
  return xmlParser.toJson(response, {object: true, coerce: true});
}

function formatDate(dateString) {
  const [month, day, year] = dateString.split('-');
  const [paddedMonth, paddedDay] = [month, day].map( n => leftPad(n, 2, 0));
  return {month: paddedMonth, day: paddedDay, year: year};
}

function scoreboardEndpointByDate(date) {
  const {month, day, year} = date;
	return `http://gd2.mlb.com/components/game/mlb/year_${year}/month_${month}/day_${day}/miniscoreboard.json`;
}

function scoreboardToGameDirs(scoreboard) {
  const games = scoreboard.data.games.game;
  const endpointBase = 'http://gd2.mlb.com';
  return games.map( game => `${endpointBase}${game.game_data_directory}/inning/inning_all.xml` );
}

async function gameEndpointsByDate(dateString) {
  return new Promise(async function(resolve, reject) {
    try {
      const scoreboardEndpoint = scoreboardEndpointByDate(dateString);
      const scoreboard = await request(scoreboardEndpoint);
      const gameDirs = scoreboardToGameDirs(JSON.parse(scoreboard.body));
      resolve(gameDirs);
    } catch(e) {
      reject(e);
    }
  });
}

async function requestEndpoints(endpoints) {
  const promises = endpoints.map( endpoint => request(endpoint) );
  return await Promise.all(promises);
}

export default async function fetchGamesByDateString(dateString) {
  return new Promise(async function(resolve, reject) {
    try {
      const date = formatDate(dateString);
      const gameEndpoints = await gameEndpointsByDate(date);
      const gameResponses = await requestEndpoints(gameEndpoints);
      const parsedGames = gameResponses.map( response => xmlResponseToJSON(response.body) );
      resolve(parsedGames);
    } catch(e) {
      reject(e);
    }
  });
}
