import R from 'ramda';
import leftPad from 'left-pad';
import { promisify } from 'bluebird';
const request = promisify(require('request'));

function scoreboardEndpointByDate(dateString) {
	const [month, day, year] = dateString.split('-');
	const [paddedMonth, paddedDay] = [month, day].map( n => leftPad(n, 2, 0));
	return `http://gd2.mlb.com/components/game/mlb/year_${year}/month_${paddedMonth}/day_${paddedDay}/miniscoreboard.json`
}

function scoreboardToGameDirs(scoreboard) {
	const games = scoreboard.data.games.game;
	const endpointBase = 'http://gd2.mlb.com';
	return games.map( game => `${endpointBase}${game.game_data_directory}/inning/inning_all.xml` );
}

export default async function gameEndpointsByDate(dateString) {
	const scoreboardEndpoint = scoreboardEndpointByDate(dateString);
	const scoreboard = await request(scoreboardEndpoint);
	return scoreboardToGameDirs(JSON.parse(scoreboard.body))
}
