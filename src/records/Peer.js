import {Record} from 'immutable'

const Peer = Record({
  id: null, // required
  projectId: null, // required
  identityId: null,
  isOnline: false,
  isSelf: false,
  canWrite: false
}, 'Peer')

export default Peer
