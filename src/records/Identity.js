import {Record} from 'immutable'

const Identity = Record({
  id: null,
  doc: null,
  isWritable: false
}, 'Identity')

export default Identity
