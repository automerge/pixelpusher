import {Record, List} from 'immutable'

const Peer = Record({
  id: null, // required
  key: null, // required
  name: "",
  isConnected: false,
  isSelf: false,
  canEdit: false,
}, "Peer")

export default Peer
