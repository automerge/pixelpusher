import {Record, List} from 'immutable'

const Peer = Record({
  id: null, // required
  key: null, // required
  isConnected: false,
  isSelf: false,
  canEdit: false,
}, "Peer")

export default Peer
