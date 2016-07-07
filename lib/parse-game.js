import R from 'ramda';

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

export default function getGamePitches(game) {
  const innings = R.prop('inning', R.prop('game', game));
  return R.flatten(R.map(getInningPitches, innings));
}
