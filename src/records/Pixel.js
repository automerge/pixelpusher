import {Record, Repeat} from 'immutable'

export const pixels = (n, color = null) =>
  Repeat(color, n).toList()
