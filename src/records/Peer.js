import {Record, List} from 'immutable'

const Peer = Record({
  id: null, // required
  isConnected: false,
  isSelf: false,
}, "Peer")

export default Peer
