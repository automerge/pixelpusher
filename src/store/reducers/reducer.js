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
  state.projects.size
    ? state
    : state.update('createdProjectCount', x => x + 1)

function changeDimensions(state, dimension, behavior) {
  return resizeProject(state, dimension, behavior)
}

function setColorSelected(state, newColorSelected, positionInPalette) {
  let palette = getPalette(state);
  let {currentSwatchIndex} = state

  if (!checkColorInPalette(palette, newColorSelected)) {
    // If there is no newColorSelected in the palette it will create one
    state = updateProject(state, Mutation.addColorToPalette(newColorSelected))

    currentSwatchIndex = palette.size;
  } else if (positionInPalette === null) {
    // Eyedropper called this function, the color position is unknown
    currentSwatchIndex = getPositionFirstMatchInPalette(palette, newColorSelected);
  }

  return state.merge({
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: false,
    currentSwatchIndex,
  });
}

function drawCell(state, id) {
  const bucketOn = state.get('bucketOn');
  const eyedropperOn = state.get('eyedropperOn');
  const eraserOn = state.get('eraserOn');

  if (bucketOn || eyedropperOn) {
    const activeFrameIndex = state.get('activeFrameIndex');
    const cellColor = getFrames(state).getIn([activeFrameIndex, 'pixels', id]);

    if (eyedropperOn) {
      return setColorSelected(state, cellColor, null);
    }
    // bucketOn
    return applyBucket(state, activeFrameIndex, id, cellColor);
  }
  // eraserOn or regular cell paint
  const used = !eraserOn;
  const color = eraserOn ?
  null : getCurrentColor(state);

  return setGridCellValue(state, color, id);
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
  state.setIn(['peers', id], Peer({key, id, isConnected: true}).merge(info))

const selfConnected = (state, key, id, canEdit) =>
  state.setIn(['peers', id], Peer({key, id, isSelf: true, isConnected: true, canEdit, name: "me"}))

const peerDisconnected = (state, key, id) =>
  state.setIn(['peers', id, 'isConnected'], false)

export default function (state = State(), action) {
  switch (action.type) {
    case 'STATE_LOADED':
      return stateLoaded(action.state)
    case 'CHANGE_DIMENSIONS':
      return changeDimensions(state, action.gridProperty, action.behaviour);
    case 'SET_COLOR_SELECTED':
      return setColorSelected(
        state, action.newColorSelected, action.paletteColorPosition
      );
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

    case 'PROJECT_CREATED':
      return state.setIn(['projects', action.project.get('id')], action.project)
        .set('currentProjectId', action.project.get('id'))

    case 'REMOTE_PROJECT_UPDATED':
      return state
        .setIn(['projects', action.project.get('id')], action.project)
        .set('currentProjectId', action.project.get('id'))

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
    case 'PROJECT_CLONED':
      return sendNotification(setProject(state, action.project), "Cloned project.")
        .delete('clonedProjectId')
    case 'DELETE_PROJECT_CLICKED':
      return sendNotification(state, 'Project deleted').update('projects', projects => projects.delete(action.id))
        .update('currentProjectId', cId => cId === action.id ? null : cId)
    case 'SHARED_PROJECT_ID_ENTERED':
      return state.projects.has(action.id)
        ? state.set('currentProjectId', action.id)
        : state.set('openingProjectId', action.id)
    case 'REMOTE_PROJECT_OPENED':
      return setProject(state, action.project).delete('openingProjectId')

    default:
      return state;
  }
}
