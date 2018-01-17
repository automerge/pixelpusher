import {Record, List} from 'immutable'
import PeerInfo from './PeerInfo'

const Peer = Record({
  id: null, // required
  key: null, // required
  info: PeerInfo(),
  isConnected: false,
  isSelf: false,
  canEdit: false,
}, "Peer")

export default Peer
