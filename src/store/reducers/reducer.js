import { List, Map } from 'immutable';
import shortid from 'shortid';
import {
  resizeProject, createPalette, resetIntervals, setGridCellValue,
  checkColorInPalette, addColorToLastCellInPalette, getPositionFirstMatchInPalette,
  applyBucket, cloneFrame, addFrameToProject, getProject, updateProject,
  mergeProject, setProject, getProjectId,
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
  const newColor = { color: newColorSelected, position: positionInPalette };
  let palette = getPalette(state);

  if (!checkColorInPalette(palette, newColorSelected)) {
    // If there is no newColorSelected in the palette it will create one
    palette = addColorToLastCellInPalette(
      palette, newColorSelected
    );
    newColor.position = palette.size - 1;
  } else if (positionInPalette === null) {
    // Eyedropper called this function, the color position is unknown
    newColor.position =
      getPositionFirstMatchInPalette(palette, newColorSelected);
  }

  return mergeProject(state, {
    palette,
  }).merge({
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: false,
    currentColor: newColor,
  });
}

function setCustomColor(state, customColor) {
  const currentColor = state.get('currentColor');
  let palette = getPalette(state);

  if (!checkColorInPalette(palette, currentColor.get('color'))) {
    // If there is no colorSelected in the palette it will create one
    palette = addColorToLastCellInPalette(
      palette, customColor
    );
    newState.currentColor.position = newState.palette.size - 1;
  } else {
    // There is a color selected in the palette
    palette = palette.set(
      currentColor.get('position'), Map({
        color: customColor, id: currentColor.get('color')
      })
    );
  }

  return mergeProject(state, {palette})
    .setIn(['currentColor', 'color'], customColor);
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
  null :
  state.get('currentColor').get('color');

  return setGridCellValue(state, color, id);
}

function setEraser(state) {
  return state.merge({
    currentColor: { color: null, position: -1 },
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
  return mergeProject(state, { cellSize });
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
  let activeFrameIndex = state.get('activeFrameIndex');
  let frames = getFrames(state);

  if (frames.size > 1) {
    const reduceFrameIndex =
      (activeFrameIndex >= frameIndex) &&
      (activeFrameIndex > 0);

    frames = resetIntervals(frames.delete(frameIndex));

    if (reduceFrameIndex) {
      activeFrameIndex = frames.size - 1;
    }
  }
  return mergeProject(state, {frames}).merge({
    activeFrameIndex
  });
}

function duplicateFrame(state, frameIndex) {
  const frames = getFrames(state);
  const prevFrame = frames.get(frameIndex);

  const frame = cloneFrame(prevFrame);

  return mergeProject(state, {
    frames: resetIntervals(frames.insert(frameIndex, frame)),
  }).merge({
    activeFrameIndex: frameIndex + 1,
  });
}

const newProject = state =>
  state.merge({
    currentProject: project(),
    activeFrameIndex: 0,
    currentColor: {color: '#000000', position: 0},
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
    case 'SET_CUSTOM_COLOR':
      return setCustomColor(state, action.customColor);
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
