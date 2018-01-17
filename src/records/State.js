import {Record, List, Map} from 'immutable'
import Project from './Project'
import PeerInfo from './PeerInfo'

export const DEFAULT_COLOR = '#313131';

const State = Record({
  isLoaded: false,
  currentProjectId: null,
  projects: Map(),
  peers: Map(),
  currentSwatchIndex: 0,
  eraserOn: false,
  eyedropperOn: false,
  colorPickerOn: false,
  bucketOn: false,
  loading: false,
  createdProjectCount: 0,
  clonedProjectId: null,
  openingProjectId: null,
  notifications: List(),
  activeFrameIndex: 0,
  duration: 1,
  peerInfo: PeerInfo(),
}, "State")

export default State
