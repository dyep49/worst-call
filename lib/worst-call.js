import R from 'ramda';
import getGamePitches from './parse-game';
import fetchGamesByDateString from './fetch-game-data';

function getCalledStrikes(game) {
  const judgeable = R.propEq('des', 'Called Strike');
  return R.filter(judgeable, getGamePitches(game));
}

function widthStrike(pitch) {
  const halfPlateWidth = 0.7083;
  return Math.abs(pitch.px) < halfPlateWidth;
}

function heightStrike(pitch) {
  const aboveSzBottom = R.gt(pitch.pz, pitch.sz_bot);
  const belowSzTop = R.lt(pitch.pz, pitch.sz_top);
  return R.both(aboveSzBottom, belowSzTop);
}

function widthMiss(pitch) {
  const halfPlateWidth = 0.7083;
  const distFromCenter = Math.abs(pitch.px);
  return distFromCenter > halfPlateWidth ? distFromCenter - halfPlateWidth : 0;
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

function maxByMiss(pitchOne, pitchTwo) {
	return distanceMissed(pitchTwo) > distanceMissed(pitchOne) ? pitchTwo : pitchOne;
}

function incorrectCalls(game) {
  const calledStrikes = getCalledStrikes(game);
  const isStrike = R.both(heightStrike, widthStrike);
  return R.reject(isStrike, calledStrikes);
}

function worstCall(games) {
	const incorrect = R.flatten(R.map(incorrectCalls, games));
  return incorrect.reduce(maxByMiss);
}

function printWorstCall(pitch) {
  const distance = distanceMissed(pitch);
  const inchesDistance = distance * 12;
  console.log('Raw pitch data: \n', pitch);
  console.log(`The worst call missed by ${inchesDistance} inches`);
}

export default async function worstCallByDateString(dateString) {
  const games = await fetchGamesByDateString(dateString);
  printWorstCall(worstCall(games));
}


