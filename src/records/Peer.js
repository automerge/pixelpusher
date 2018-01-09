import {Record, List} from 'immutable'

const Peer = Record({
  id: null, // required
  isConnected: false,
}, "Peer")

export default Peer
