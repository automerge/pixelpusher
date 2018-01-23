import { List, Map } from 'immutable';
import shortid from 'shortid';
import {
  resizeProject, createPalette, resetIntervals, setGridCellValue,
  checkColorInPalette, addColorToLastCellInPalette, getPositionFirstMatchInPalette,
  applyBucket, cloneFrame, addFrameToProject, getProject, updateProject,
  setProject, getProjectId, getCurrentColor,
} from './reducerHelpers';
import * as Mutation from '../../logic/Mutation'
import {project} from '../../records/Project'
import State from '../../records/State'
import Peer from '../../records/Peer'
import PeerInfo from '../../records/PeerInfo'

const getPalette = state =>
  getProject(state).get('palette');

const getFrames = state =>
  getProject(state).get('frames');

const getDimension = (type, state) =>
  getProject(state).get(type);

const getColumns = state =>
  getDimension('columns', state);

const getRows = state =>
  getDimension('rows', state);

const setProjectId = (state, id) =>
  state.set('currentProjectId', id).merge({
    activeFrameIndex: 0,
  })

const cloneProject = (state) =>
  state.setIn(['currentProject', 'id'], null)

const stateLoaded = state =>
  state.set('isLoaded', true)

const addProject = (state, project) =>
  state.setIn(['projects', project._actorId], project)

function changeDimensions(state, dimension, behavior) {
  return resizeProject(state, dimension, behavior)
}

function setColorSelected(state, swatchId) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: false,
    currentSwatchIndex: swatchId,
  });
}

function drawCell(state, pixelIndex) {
  const bucketOn = state.get('bucketOn');
  const eyedropperOn = state.get('eyedropperOn');
  const eraserOn = state.get('eraserOn');

  if (bucketOn || eyedropperOn) {
    const activeFrameIndex = state.get('activeFrameIndex');
    const swatchId = getFrames(state).getIn([activeFrameIndex, 'pixels', pixelIndex]);

    if (eyedropperOn) {
      return setColorSelected(state, swatchId);
    }
    // bucketOn
    return applyBucket(state, activeFrameIndex, pixelIndex, swatchId);
  }
  // eraserOn or regular cell paint
  const used = !eraserOn;
  const swatchId = eraserOn ?
  null : state.currentSwatchIndex;

  return setGridCellValue(state, pixelIndex, swatchId);
}

function setEraser(state) {
  return state.merge({
    currentSwatchIndex: null,
    eraserOn: true,
    eyedropperOn: false,
    colorPickerOn: false,
    bucketOn: false
  });
}

function setBucket(state) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: false,
    bucketOn: !state.get('bucketOn')
  });
}

function setEyedropper(state) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: true,
    colorPickerOn: false,
    bucketOn: false
  });
}

function setColorPicker(state) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: true,
    bucketOn: false
  });
}

function setCellSize(state, cellSize) {
  return updateProject(state, Mutation.setCellSize(cellSize))
}

function resetFrame(state, activeFrameIndex) {
  const color = getProject(state).get('defaultColor')
  return updateProject(state, Mutation.resetFrame(activeFrameIndex))
}

function showSpinner(state) {
  return state.merge({ loading: true });
}

function hideSpinner(state) {
  return state.merge({ loading: false });
}

function sendNotification(state, message) {
  return state.merge({
    notifications: message === '' ? List() : List([{ message, id: 0 }])
  });
}

function changeActiveFrame(state, frameIndex) {
  return state.merge({ activeFrameIndex: frameIndex });
}

function createNewFrame(state) {
  return addFrameToProject(state)
    .set('activeFrameIndex', getFrames(state).size)
}

function deleteFrame(state, frameIndex) {
  return updateProject(state, Mutation.deleteFrame(frameIndex, state.activeFrameIndex))
    .update('activeFrameIndex', i =>
      frameIndex > i ? i : i - 1)
}

function duplicateFrame(state, frameIndex) {
  return updateProject(state, Mutation.cloneFrame(frameIndex))
    .update('activeFrameIndex', i => i + 1)

}

const newProject = state =>
  state.merge({
    currentProject: project(),
    activeFrameIndex: 0,
    currentSwatchIndex: 0,
  })

function setDuration(state, duration) {
  return state.merge({ duration });
}

function changeFrameInterval(state, frameIndex, interval) {
  return updateProject(state, Mutation.setFrameInterval(frameIndex, interval))
}

const peerConnected = (state, key, id, info) =>
  state.setIn(['peers', id], Peer({key, id, isConnected: true, info: PeerInfo(info.peerInfo)}))

const selfConnected = (state, key, id, canEdit) =>
  state.setIn(['peers', id], Peer({key, id, isSelf: true, isConnected: true, canEdit, info: state.peerInfo}))

const peerDisconnected = (state, key, id) =>
  state.deleteIn(['peers', id])
  // state.setIn(['peers', id, 'isConnected'], false)

export default function (state = State(), action) {
  switch (action.type) {
    case 'STATE_LOADED':
      return stateLoaded(action.state)
    case 'CHANGE_DIMENSIONS':
      return changeDimensions(state, action.gridProperty, action.behaviour);
    case 'SET_COLOR_SELECTED':
      return setColorSelected( state, action.newColorSelected);
    case 'SWATCH_CLICKED':
      return state.merge({
        currentSwatchIndex: action.index,
        eraserOn: false,
        eyedropperOn: false,
        colorPickerOn: false,
        bucketOn: false,
      })
    case 'SET_SWATCH_COLOR':
      return state.currentSwatchIndex != null
        ? updateProject(state, Mutation.setSwatchColor(state.currentSwatchIndex, action.color))
        : updateProject(state, Mutation.addColorToPalette(action.color))
            .set('currentSwatchIndex', getPalette(state).size)
    case 'DRAW_CELL':
      return drawCell(state, action.id);
    case 'SET_ERASER':
      return setEraser(state);
    case 'SET_BUCKET':
      return setBucket(state);
    case 'SET_EYEDROPPER':
      return setEyedropper(state);
    case 'SET_COLOR_PICKER':
      return setColorPicker(state);
    case 'SET_CELL_SIZE':
      return setCellSize(state, action.cellSize);
    case 'SET_RESET_GRID':
      return resetFrame(state, action.activeFrameIndex);
    case 'SHOW_SPINNER':
      return showSpinner(state);
    case 'HIDE_SPINNER':
      return hideSpinner(state);
    case 'SEND_NOTIFICATION':
      return sendNotification(state, action.message);
    case 'CHANGE_ACTIVE_FRAME':
      return changeActiveFrame(state, action.frameIndex);
    case 'CREATE_NEW_FRAME':
      return createNewFrame(state);
    case 'DELETE_FRAME':
      return deleteFrame(state, action.frameIndex);
    case 'DUPLICATE_FRAME':
      return duplicateFrame(state, action.frameIndex);
    case 'SET_DURATION':
      return setDuration(state, action.duration);
    case 'CHANGE_FRAME_INTERVAL':
      return changeFrameInterval(state, action.frameIndex, action.interval);
    case 'NEW_PROJECT':
      return newProject(state);
    case 'CLONE_PROJECT':
      return cloneProject(state);
    case 'PROJECT_TITLE_CHANGED':
      return updateProject(state, Mutation.setTitle(action.title))
    case 'SELF_NAME_CHANGED':
      return state.setIn(['peerInfo', 'name'], action.name)
    case 'SELF_AVATAR_SET':
      return state.setIn(['peerInfo', 'avatarKey'], action.key)

    case 'PROJECT_CREATED':
      return state.setIn(['projects', action.project._actorId], action.project)
        .set('currentProjectId', action.project._actorId)

    case 'SET_PROJECT':
      return setProjectId(state, action.id);

    case 'PEER_CONNECTED':
      return peerConnected(state, action.key, action.id, action.info)
    case 'SELF_CONNECTED':
      return selfConnected(state, action.key, action.id, action.writable)
    case 'PEER_DISCONNECTED':
      return peerDisconnected(state, action.key, action.id)
    case 'NEW_PROJECT_CLICKED':
      return state.update('createdProjectCount', x => x + 1)
    case 'PROJECT_CREATED':
      return setProject(state, action.project)
    case 'CLONE_CURRENT_PROJECT_CLICKED':
      return state.set('clonedProjectId', getProjectId(state))
    case 'MERGE_PROJECT_CLICKED':
      return state.set('mergingProjectId', action.id)
    case 'PROJECT_CLONED':
      return setProject(state, action.project)
        .delete('clonedProjectId')
    case 'PROJECT_MERGED':
      return setProject(state, action.project)
        .delete('mergedProjectId')
    case 'DELETE_PROJECT_CLICKED':
      return state.set('deletingProjectId', action.id)
    case 'PROJECT_DELETED':
      return sendNotification(state.update('projects', p => p.delete(action.id)), 'Project deleted')
      .update('currentProjectId', cId => cId === action.id ? null : cId)
    case 'SHARED_PROJECT_ID_ENTERED':
      return state.projects.has(action.id)
        ? state.set('currentProjectId', action.id)
        : state.set('openingProjectId', action.id)

    case 'REMOTE_PROJECT_OPENED':
    case 'REMOTE_PROJECT_UPDATED':
      return state.openingProjectId === action.project._actorId
        ? setProject(state, action.project).delete('openingProjectId')
        : addProject(state, action.project)

    case 'PIXELS_IMPORTED':
      return updateProject(state, Mutation.addFrameFromPixels(action.pixels, action.width, action.height))

    default:
      return state;
  }
}
