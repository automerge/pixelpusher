import { List } from 'immutable'
import {
  resizeProject, setGridCellValue,
  applyBucket, addFrameToProject, getProject, updateProject,
  setProject, updateIdentity, toggleFollowProject
} from './reducerHelpers'
import * as Mutation from '../../logic/Mutation'
import Project, { project } from '../../records/Project'
import State from '../../records/State'
import Peer from '../../records/Peer'
import CloudPeer from '../../records/CloudPeer'
import Identity from '../../records/Identity'

const getPalette = state =>
  getProject(state).doc.getIn('palette')

const getFrames = state =>
  getProject(state).doc.get('frames')

const setProjectId = (state, id) =>
  state.set('currentProjectId', id)
  .remove('activeFrameIndex')
  .remove('liveIds')
  // .update(autoFollowProjects)

const addProject = (state, project) => {
  return state.setIn(['projects', project.id], project)
  // return autoFollowProject(state.setIn(['projects', project.id], project), project)
}

const addIdentity = (state, identity) =>
  state.setIn(['identities', identity.id], identity)

function changeDimensions (state, dimension, behavior) {
  return resizeProject(state, dimension, behavior)
}

function setColorSelected (state, swatchId) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: false,
    currentSwatchIndex: swatchId
  })
}

function drawCell (state, pixelIndex) {
  const bucketOn = state.get('bucketOn')
  const eyedropperOn = state.get('eyedropperOn')
  const eraserOn = state.get('eraserOn')

  if (bucketOn || eyedropperOn) {
    const activeFrameIndex = state.get('activeFrameIndex')
    const swatchId = getFrames(state).getIn([activeFrameIndex, 'pixels', pixelIndex])

    if (eyedropperOn) {
      return setColorSelected(state, swatchId)
    }
    // bucketOn
    return applyBucket(state, activeFrameIndex, pixelIndex, swatchId)
  }
  // eraserOn or regular cell paint
  const swatchId = eraserOn
  ? null : state.currentSwatchIndex

  return setGridCellValue(state, pixelIndex, swatchId)
}

function setEraser (state) {
  return state.merge({
    currentSwatchIndex: null,
    eraserOn: true,
    eyedropperOn: false,
    colorPickerOn: false,
    bucketOn: false
  })
}

function setBucket (state) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: false,
    bucketOn: !state.get('bucketOn')
  })
}

function setEyedropper (state) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: true,
    colorPickerOn: false,
    bucketOn: false
  })
}

function setColorPicker (state) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: true,
    bucketOn: false
  })
}

function setCellSize (state, cellSize) {
  return updateProject(state, Mutation.setCellSize(cellSize))
}

function resetFrame (state, activeFrameIndex) {
  return updateProject(state, Mutation.resetFrame(activeFrameIndex))
}

function showSpinner (state) {
  return state.merge({ loading: true })
}

function hideSpinner (state) {
  return state.merge({ loading: false })
}

function sendNotification (state, message) {
  return state.merge({
    notifications: message === '' ? List() : List([{ message, id: 0 }])
  })
}

function changeActiveFrame (state, frameIndex) {
  return state.merge({ activeFrameIndex: frameIndex })
}

function createNewFrame (state) {
  return addFrameToProject(state)
    .set('activeFrameIndex', getFrames(state).size)
}

function deleteFrame (state, frameIndex) {
  return updateProject(state, Mutation.deleteFrame(frameIndex, state.activeFrameIndex))
    .update('activeFrameIndex', i =>
      frameIndex > i ? i : i - 1)
}

function duplicateFrame (state, frameIndex) {
  return updateProject(state, Mutation.cloneFrame(frameIndex))
    .set('activeFrameIndex', frameIndex + 1)
}

const newProject = state =>
  state.merge({
    currentProject: project(),
    activeFrameIndex: 0,
    currentSwatchIndex: 0
  })

function setDuration (state, duration) {
  return state.merge({ duration })
}

function changeFrameInterval (state, frameIndex, interval) {
  return updateProject(state, Mutation.setFrameInterval(frameIndex, interval))
}

const identityUpdated = (state, key, identity) =>
  state.setIn(['identities', key], Identity(identity))

const selfConnected = (state, key, id, canEdit) =>
  state.setIn(['peers', id], Peer({key, id, isSelf: true, isConnected: true, canEdit, info: state.peerInfo}))

const documentCreated = (state, action) => {
  const {type} = action.metadata
  switch (type) {
    case 'Identity':
      return addIdentity(state, makeIdentity(action))
        .set('identityId', action.id)
    case 'Project':
      return setProject(state, makeProject(action))
        .set('activeFrameIndex', 0)
    default:
      throw new Error(`Unknown document type: ${type}`)
  }
}

const documentForked = (state, action) => {
  return setProject(state, makeProject(action))
}

const documentOpened = (state, action) => {
  return setProject(state, project)
}

const documentReady = (state, action) => {
  const {type} = action.metadata

  switch (type) {
    case 'Identity':
      return addIdentity(state, makeIdentity(action))
    case 'Project':
      return addProject(state, makeProject(action))
    default:
      throw new Error(`Unknown document type: ${type}`)
  }
}

const documentUpdated = (state, action) => {
  const {type} = action.metadata

  switch (type) {
    case 'Identity':
      return addIdentity(state, makeIdentity(action))
    case 'Project':
      return addProject(state, makeProject(action))
    default:
      throw new Error(`Unknown document type: ${type}`)
  }
}

const documentMetadata = (state, action) => {
  const {type} = action.metadata

  switch (type) {
    case 'Project':
      return addProject(state, makeProject(action))

    default:
      return state
  }
}

const peerLeft = (state, id) =>
  state.setIn(['peers', id, 'isOnline'], false)

const makeProject = ({id, doc, isWritable, metadata: {identityId, relativeId} = {}}) =>
  Project({
    id,
    doc,
    isWritable,
    identityId,
    relativeId: relativeId || (doc && doc.get('relativeId'))
  })

const makeIdentity = ({id, doc, isWritable}) =>
  Identity({ id, doc, isWritable })

const makePeer = ({id, docId, canWrite, isOnline}) =>
  Peer({
    id,
    projectId: docId,
    isOnline,
    canWrite
  })

export default function (state = State(), action) {
  if (action.type !== 'CLOUD_PEER_PING') {
    console.log(action)
  }

  switch (action.type) {
    // HyperMerge actions:

    case 'HYPERMERGE_READY':
      return state.setIn(['archiverKey'], action.archiverKey)

    case 'DOCUMENT_READY':
      return documentReady(state, action)

    case 'DOCUMENT_MERGED':
    case 'DOCUMENT_UPDATED':
      return documentUpdated(state, action)

    case 'DOCUMENT_FORKED':
      return documentForked(state, action)

    case 'DOCUMENT_OPENED':
      return documentOpened(state, action)

    case 'DOCUMENT_CREATED':
      return documentCreated(state, action)

    case 'DOCUMENT_DELETED':
      return sendNotification(state, 'Project deleted')
      .update('currentProjectId', cId => cId === action.id ? null : cId)
      .update('projects', ps => ps.delete(action.id))

    case 'DOCUMENT_METADATA':
      return documentMetadata(state, action)

    // End HyperMerge actions

    case 'CHANGE_DIMENSIONS':
      return changeDimensions(state, action.gridProperty, action.behaviour)
    case 'SET_COLOR_SELECTED':
      return setColorSelected(state, action.newColorSelected)
    case 'SWATCH_CLICKED':
      return state.merge({
        currentSwatchIndex: action.index,
        eraserOn: false,
        eyedropperOn: false,
        colorPickerOn: false,
        bucketOn: false
      })
    case 'SET_SWATCH_COLOR':
      return state.currentSwatchIndex != null
        ? updateProject(state, Mutation.setSwatchColor(state.currentSwatchIndex, action.color))
        : updateProject(state, Mutation.addColorToPalette(action.color))
            .set('currentSwatchIndex', getPalette(state).size)
    case 'DRAW_CELL':
      return drawCell(state, action.id)
    case 'SET_ERASER':
      return setEraser(state)
    case 'SET_BUCKET':
      return setBucket(state)
    case 'SET_EYEDROPPER':
      return setEyedropper(state)
    case 'SET_COLOR_PICKER':
      return setColorPicker(state)
    case 'SET_CELL_SIZE':
      return setCellSize(state, action.cellSize)
    case 'SET_RESET_GRID':
      return resetFrame(state, action.activeFrameIndex)
    case 'SHOW_SPINNER':
      return showSpinner(state)
    case 'HIDE_SPINNER':
      return hideSpinner(state)
    case 'SEND_NOTIFICATION':
      return sendNotification(state, action.message)
    case 'CHANGE_ACTIVE_FRAME':
      return changeActiveFrame(state, action.frameIndex)
    case 'CREATE_NEW_FRAME':
      return createNewFrame(state)
    case 'DELETE_FRAME':
      return deleteFrame(state, action.frameIndex)
    case 'DUPLICATE_FRAME':
      return duplicateFrame(state, action.frameIndex)
    case 'SET_DURATION':
      return setDuration(state, action.duration)
    case 'CHANGE_FRAME_INTERVAL':
      return changeFrameInterval(state, action.frameIndex, action.interval)
    case 'NEW_PROJECT':
      return newProject(state)
    case 'PROJECT_TITLE_CHANGED':
      return updateProject(state, Mutation.setTitle(action.title))
    case 'SELF_NAME_CHANGED':
      return updateIdentity(state, Mutation.setName(action.name))
    case 'AVATAR_BUTTON_CLICKED':
      return updateIdentity(state, Mutation.setAvatarId(action.id))
    case 'IDENTITY_CREATED':
      return state.setIn(['peerInfo', 'identity'], action.key)

    case 'SET_PROJECT':
      return setProjectId(state, action.id)

    case 'IDENTITY_UPDATE':
      return identityUpdated(state, action.key, action.project)

    // case 'PEER_JOINED':
    // case 'PEER_LEFT':
    //   return addPeer(state, makePeer(action))

    case 'SELF_CONNECTED':
      return selfConnected(state, action.key, action.id, action.writable)
    case 'PIXELS_IMPORTED':
      return updateProject(state, Mutation.addFrameFromPixels(action.pixels, action.width, action.height))

    case 'MERGE_PREVIEW_STARTED':
      return state.set('mergePreviewProjectId', action.id)

    case 'MERGE_PREVIEW_ENDED':
      return state.delete('mergePreviewProjectId')

    case 'PIXEL_CONFLICT_CLICKED':
      return setGridCellValue(state, action.index, action.swatchIndex)

    case 'PROJECT_VERSION_CLICKED':
      return setProjectId(state, action.id)

    case 'PROJECT_VERSION_DOUBLE_CLICKED':
      return setProjectId(state, action.id)

    case 'FOLLOW_PROJECT_CLICKED':
      return toggleFollowProject(state, action.id)

    case 'ADD_CLOUD_PEER':
      return state.setIn(['cloudPeers', action.key], CloudPeer())

    case 'REMOVE_CLOUD_PEER':
      return state.deleteIn(['cloudPeers', action.key])

    case 'CLOUD_PEER_PING':
      const cloudPeer = CloudPeer({
        name: action.name,
        timestamp: action.timestamp
      })
      return state.setIn(['cloudPeers', action.key], cloudPeer)

    default:
      return state
  }
}
