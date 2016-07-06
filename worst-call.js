import R from 'ramda';
import leftPad from 'left-pad';
import xmlParser from 'xml2json';
import Promise from 'bluebird';
import req from 'request';
const request = Promise.promisify(req);

import gameEndpointsByDate from './generate-endpoints';

const url = 'http://gd2.mlb.com/components/game/mlb/year_2016/month_06/day_06/gid_2016_06_06_anamlb_nyamlb_1/inning/inning_all.xml';

function xmlResponseToJSON(response) {
  return xmlParser.toJson(response.body, {object: true, coerce: true});
}

function getAtBatPitches(atbat) {
  return R.prop('pitch', atbat);
}

function getHalfInningPitches(halfInning) {
  const atBats = halfInning.atbat;
  return R.flatten(R.map(getAtBatPitches, atBats));
}

function getInningPitches(inning) {
  const halfInnings = [inning.top, inning.bottom].filter(halfInning => halfInning);
  return R.flatten(R.map(getHalfInningPitches, halfInnings));
}

function getGamePitches(game) {
  const innings = R.prop('inning', R.prop('game', game));
  return R.flatten(R.map(getInningPitches, innings));
}

function getCalledStrikes(game) {
  const judgeable = R.propEq('des', 'Called Strike');
  return R.filter(judgeable, getGamePitches(game));
}

function widthStrike(pitch) {
  const halfPlateWidth = 0.7083;
  return Math.abs(pitch.px) < halfPlateWidth
}

function heightStrike(pitch) {
  return (pitch.pz < pitch.sz_top) && (pitch.pz > pitch.sz_bot)
}

function isStrike(pitch) {
  return heightStrike(pitch) && widthStrike(pitch)
}

function widthMiss(pitch) {
  const halfPlateWidth = 0.7083;
  const distFromCenter = Math.abs(pitch.px);
  return distFromCenter > halfPlateWidth ? distFromCenter - halfPlateWidth : 0
}

function heightMiss(pitch) {
  return Math.max(0, Math.max(pitch.pz - pitch.sz_top, pitch.sz_bot - pitch.pz));
}

function distanceFormula(a, b) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

function distanceMissed(pitch) {
  const widthDistMiss = widthMiss(pitch);
  const heightDistMiss = heightMiss(pitch);
  return distanceFormula(widthDistMiss, heightDistMiss);
}

function printWorstCall(pitch) {
	console.log(pitch);
  const inchesMissed = distanceMissed(pitch) * 12;
  console.log(`The worst call missed by: ${inchesMissed} inches`);
}

function maxByMiss(pitchOne, pitchTwo) {
	return distanceMissed(pitchTwo) > distanceMissed(pitchOne) ? pitchTwo : pitchOne
}

function incorrectCalls(game) {
  const calledStrikes = getCalledStrikes(game);
  return R.reject(isStrike, calledStrikes);
}

export default async function worstCall(date) {
	const gameEndpoints = await gameEndpointsByDate(date);
	const promises = gameEndpoints.map( endpoint => request(endpoint) );
	const games = await Promise.all(promises);
	const parsedGames = games.map( (game, idx) => {
			return xmlResponseToJSON(game)
	})
	const incorrect = R.flatten(R.map(incorrectCalls, parsedGames));
	printWorstCall(incorrect.reduce(maxByMiss));
}

