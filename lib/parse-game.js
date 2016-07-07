import R from 'ramda';

function getAtBatPitches(atbat) {
  return R.prop('pitch', atbat);
}

function getHalfInningPitches(halfInning) {
  const atBats = halfInning.atbat;
  return R.chain(getAtBatPitches, atBats);
}

function getInningPitches(inning) {
  const halfInnings = R.reject(R.isNil, [inning.top, inning.bottom]);
  return R.chain(getHalfInningPitches, halfInnings);
}

export default function getGamePitches(game) {
  const innings = R.prop('inning', R.prop('game', game));
  return R.chain(getInningPitches, innings);
}

