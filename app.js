const R = require('ramda');
const xmlParser = require('xml2json');
const bluebird = require('bluebird');
const request = bluebird.promisify(require('request'));

const url = 'http://gd2.mlb.com/components/game/mlb/year_2016/month_06/day_06/gid_2016_06_06_anamlb_nyamlb_1/inning/inning_all.xml';

function xmlResponseToJSON(response) {
  return xmlParser(response.body);
}

request(url).then(parseData);

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
  return Math.abs(pitch.px) > halfPlateWidth;
}

function heightStrike(pitch) {
  (pitch.pz < pitch.sz_top) && (pitch.pz > pitch.sz_bot);
}

function notStrike(pitch) {
  return heightStrike(pitch) || widthStrike(pitch)
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
  debugger;
  return distanceFormula(widthDistMiss, heightDistMiss);
}

function printWorstCall(pitch) {
  const inchesMissed = distanceMissed(pitch) * 12;
  console.log(`The worst call missed by: ${inchesMissed} inches`);
}

function parseData(response) {
  const game = xmlParser.toJson(response.body, {object: true, coerce: true});
  const calledStrikes = getCalledStrikes(game);
  const incorrectCalls = R.filter(notStrike, calledStrikes);

  const worstCall = incorrectCalls.reduce( (prev, next) => {
    return distanceMissed(next) > distanceMissed(prev) ? next : prev
  });

  printWorstCall(worstCall);


  // const worstCall = R.reduce(R.maxBy(distanceMissed), 0, incorrectCalls);
  // const worstCall = R.map(distanceMissed, incorrectCalls);
}
