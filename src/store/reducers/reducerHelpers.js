import { List, Map, fromJS } from 'immutable';
import shortid from 'shortid';
import { pixels as pixelList } from '../../records/Pixel';
import { frameOfSize } from '../../records/Frame';
import * as Mutation from '../../logic/Mutation'

export const getProjectId = state =>
  state.currentProjectId || state.projects.keySeq().first()

export const getProject = state =>
  state.projects.get(getProjectId(state))

export const getInProject = (state, path, value) => {
  const project = getProject(state)
  return project ? project.getIn(path) : null
}

export const setProject = (state, project) =>
  state
  .setIn(['projects', project.get('id')], project)
  .set('currentProjectId', project.get('id'))

export const updateProject = (state, f) =>
  state.updateIn(['projects', getProjectId(state)], f)

export const mergeProject = (state, obj) =>
  updateProject(state, project => project.merge(obj))

export function addFrameToProject(state) {
  return updateProject(state, Mutation.addFrame())
}

export function resizeProject(state, dimension, behavior) {
  return updateProject(state, Mutation.resize(dimension, behavior))
}

export function resizePixels(pixels, dimension, behavior, columns) {
  if (dimension === 'columns') {
    if (behavior === 'add') {
      const size = pixels.size;

      for (let i = size; i > 0; i -= columns) {
        pixels = pixels.splice(i, 0, null);
      }

      return pixels
    } else {
      return pixels.filterNot((_, i) => (i + 1) % columns === 0)
    }
  } else if (dimension === 'rows') {
    if (behavior === 'add') {
      return pixels.concat(pixelList(columns, null))
    } else {
      return pixels.skipLast(columns)
    }
  }
}

export function cloneFrame(frame) {
  return frame.set('id', shortid.generate())
}

export function checkColorInPalette(palette, color) {
  const sameColors = palette.filter(currentColor =>
    (currentColor.get('color') === color)
  );
  return (sameColors.size > 0);
}

export function getPositionFirstMatchInPalette(palette, color) {
  return palette.reduce((acc, currentColor, index) => {
    let currentPosition = acc;
    if (currentPosition === -1 && currentColor.get('color') === color) {
      currentPosition = index;
    }
    return currentPosition;
  }, -1);
}

export function addColorToLastCellInPalette(palette, newColor) {
  return palette.map((currentColor, i, collection) => {
    if (i === collection.size - 1) {
      // Last cell
      return (Map({ color: newColor }));
    }
    return (Map({ color: currentColor.get('color') }));
  });
}

export function resetIntervals(frames) {
  const equalPercentage = 100 / frames.size;

  return frames.map((frame, index) => {
    const percentage = index ===
      frames.size - 1 ? 100 : Math.round(((index + 1) * equalPercentage) * 10) / 10;

    return frame.set('interval', percentage);
  });
}

export function setGridCellValue(state, color, index) {
  return updateProject(state, Mutation.setPixel(state.activeFrameIndex, index, color))
}

function getSameColorAdjacentCells(frameGrid, columns, rows, id, color) {
  const adjacentCollection = [];
  let auxId;

  if ((id + 1) % columns !== 0) {
    // Not at the very right
    auxId = id + 1;
    if (frameGrid.get(auxId) === color) {
      adjacentCollection.push(auxId);
    }
  }
  if (id % columns !== 0) {
    // Not at the very left
    auxId = id - 1;
    if (frameGrid.get(auxId) === color) {
      adjacentCollection.push(auxId);
    }
  }
  if (id >= columns) {
    // Not at the very top
    auxId = id - columns;
    if (frameGrid.get(auxId) === color) {
      adjacentCollection.push(auxId);
    }
  }
  if (id < (columns * rows) - columns) {
    // Not at the very bottom
    auxId = id + columns;
    if (frameGrid.get(auxId) === color) {
      adjacentCollection.push(auxId);
    }
  }

  return adjacentCollection;
}

export function applyBucket(state, activeFrameIndex, id, sourceColor) {
  const columns = getProject(state).get('columns');
  const rows = getProject(state).get('rows');
  const queue = [id];
  let currentColor = state.get('currentColor').get('color');
  let currentId;
  let newState = state;
  let adjacents;
  let auxAdjacentId;
  let auxAdjacentColor;

  if (!currentColor) {
    // If there is no color selected in the palette, it will choose the first one
    currentColor = getProject(newState).getIn(['palette', 0, 'color']);
    newState = newState.set('currentColor', Map({ color: currentColor, position: 0 }));
  }

  while (queue.length > 0) {
    currentId = queue.shift();
    newState = setGridCellValue(newState, currentColor, currentId);
    adjacents = getSameColorAdjacentCells(
      getProject(newState).getIn(['frames', activeFrameIndex, 'pixels']),
      columns, rows, currentId, sourceColor
    );

    for (let i = 0; i < adjacents.length; i++) {
      auxAdjacentId = adjacents[i];
      auxAdjacentColor = getProject(newState).getIn(
        ['frames', activeFrameIndex, 'pixels', auxAdjacentId]
      );
      // Avoid introduce repeated or painted already cell into the queue
      if (
        (queue.indexOf(auxAdjacentId) === -1) &&
        (auxAdjacentColor !== currentColor)
      ) {
        queue.push(auxAdjacentId);
      }
    }
  }

  return newState;
}
