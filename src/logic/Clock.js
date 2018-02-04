import {Map} from 'immutable'

export const common = (clock1, clock2) =>
  clock1.reduce(
    (res, seq, k) =>
      res.set(k, Math.min(seq, clock2.get(k, 0))),
    Map()).filter(x => x > 0)

export const lessOrEqual = (clock1, clock2) =>
  clock1.keySeq().concat(clock2.keySeq())
  .reduce(
    (result, key) =>
      (result && clock1.get(key, 0) <= clock2.get(key, 0)),
    true)

export const comparator = (a, b) => {
  if (a.equals(b)) return 0
  if (lessOrEqual(a, b)) return -1
  return 1
}

export const isSame = (small, big) =>
  small.every((seq, k) =>
    seq === big.get(k))

export const isUpstream = (parent, child) =>
  parent.every((seq, k) =>
    seq <= child.get(k, 0))
