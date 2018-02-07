import {Record, List, Map} from 'immutable'
import PeerInfo from './PeerInfo'

export const DEFAULT_COLOR = '#313131';

const State = Record({
  isLoaded: false,
  currentProjectId: null,
  focusedProjectId: null,
  projects: Map(),
  peers: Map(),
  identities: Map(),
  currentSwatchIndex: 0,
  eraserOn: false,
  eyedropperOn: false,
  colorPickerOn: false,
  bucketOn: false,
  loading: false,
  createdProjectCount: 0,
  mergePreviewProjectId: null,
  mergingProjectId: null,
  notifications: List(),
  activeFrameIndex: 0,
  duration: 1,
  peerInfo: PeerInfo(),
  cloudPeers: Map(),
  archiverKey: null
}, "State")

export default State
