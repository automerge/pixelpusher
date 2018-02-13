import {Record, List} from 'immutable'

const Tree = Record({
  value: null,
  children: List()
}, 'Tree')

export default Tree
