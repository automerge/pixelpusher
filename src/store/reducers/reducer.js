import { List, Map } from 'immutable';
import shortid from 'shortid';
import {
  createGrid, resizeProject, createPalette, resetIntervals, setGridCellValue,
  checkColorInPalette, addColorToLastCellInPalette, getPositionFirstMatchInPalette,
  applyBucket, cloneFrame, addFrameToProject,
} from './reducerHelpers';
import {project} from '../../records/Project'

function setInitialState(state) {
  const currentColor = { color: '#000000', position: 0 };

  const initialState = {
    currentProject: project(),
    currentColor,
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: false,
    bucketOn: false,
    loading: false,
    notifications: List(),
    activeFrameIndex: 0,
    duration: 1
  };

  return state.merge(initialState);
}

const getPalette = state =>
  state.getIn(['currentProject', 'palette']);

const getFrames = state =>
  state.getIn(['currentProject', 'frames']);

const getDimension = (type, state) =>
  state.getIn(['currentProject', type]);

const getColumns = state =>
  getDimension('columns', state);

const getRows = state =>
  getDimension('rows', state);

const setProject = (state, project) =>
  state.set('currentProject', project).set('activeFrameIndex', 0)

const cloneProject = (state) =>
  state.setIn(['currentProject', 'id'], shortid.generate())

const mergeProject = (state, props) =>
  state.mergeIn(['currentProject'], props)

function changeDimensions(state, dimension, behavior) {
  return state.update('currentProject', project =>
    resizeProject(project, dimension, behavior))
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

  return setGridCellValue(state, color, used, id);
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

function resetFrame(state, columns, rows, activeFrameIndex) {
  const color = state.getIn(['currentProject', 'defaultColor'])
  return state.updateIn(['currentProject', 'frames', activeFrameIndex, 'pixels'], pixels =>
    pixels.map(_ => null))
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
  return state
    .update('currentProject', addFrameToProject)
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

function setDuration(state, duration) {
  return state.merge({ duration });
}

function changeFrameInterval(state, frameIndex, interval) {
  return state.setIn(['currentProject', 'frames', frameIndex, 'interval'], interval)
}

export default function (state = Map(), action) {
  switch (action.type) {
    case 'SET_INITIAL_STATE':
      return setInitialState(state);
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
    case 'SET_PROJECT':
      return setProject(state, action.project);
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
      return resetFrame(
        state, action.columns, action.rows,
        action.activeFrameIndex);
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
      return setInitialState(state);
    case 'CLONE_PROJECT':
      return cloneProject(state);
    default:
  }
  return state;
}
