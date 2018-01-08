import { List, Map, fromJS } from 'immutable';
import shortid from 'shortid';
import Pixel, { emptyPixel, emptyPixels } from '../../records/Pixel';
import { frameOfSize } from '../../records/Frame';

export function createGrid(cellsCount, initialColor, intervalPercentage) {
  let newGrid = List();
  // Set every cell with the initial color
  for (let i = 0; i < cellsCount; i++) {
    newGrid = newGrid.push(Map({ color: initialColor, used: false }));
  }

  return Map({ grid: newGrid, interval: intervalPercentage, key: shortid.generate() });
}

export function addFrameToProject(project) {
  return project.update('frames', frames =>
    resetIntervals(frames.push(frameOfSize(project.get('rows'), project.get('columns'), project.get('defaultColor')))))
}

export function resizeProject(project, dimension, behavior) {
  const delta = behavior === 'add' ? 1 : -1
  const color = project.get('defaultColor')
  const columns = project.get('columns')

  return project
    .update(dimension, d => d + delta)
    .update('frames', frames =>
      frames.map(frame =>
        frame.update('pixels', pixels =>
          resizePixels(pixels, dimension, behavior, color, columns))))
}

export function resizePixels(pixels, dimension, behavior, color, columns) {
  if (dimension === 'columns') {
    if (behavior === 'add') {
      const size = pixels.size;

      for (let i = size; i > 0; i -= columns) {
        pixels = pixels.splice(i, 0, emptyPixel(color));
      }

      return pixels
    } else {
      return pixels.filterNot((_, i) => (i + 1) % columns === 0)
    }
  } else if (dimension === 'rows') {
    if (behavior === 'add') {
      return pixels.concat(emptyPixels(columns, color))
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

export function setGridCellValue(state, color, used, id) {
  return state.setIn(
    ['currentProject', 'frames', state.get('activeFrameIndex'), 'pixels', id],
    Pixel({ color, used })
  );
}

function getSameColorAdjacentCells(frameGrid, columns, rows, id, color) {
  const adjacentCollection = [];
  let auxId;

  if ((id + 1) % columns !== 0) {
    // Not at the very right
    auxId = id + 1;
    if (frameGrid.get(auxId).get('color') === color) {
      adjacentCollection.push(auxId);
    }
  }
  if (id % columns !== 0) {
    // Not at the very left
    auxId = id - 1;
    if (frameGrid.get(auxId).get('color') === color) {
      adjacentCollection.push(auxId);
    }
  }
  if (id >= columns) {
    // Not at the very top
    auxId = id - columns;
    if (frameGrid.get(auxId).get('color') === color) {
      adjacentCollection.push(auxId);
    }
  }
  if (id < (columns * rows) - columns) {
    // Not at the very bottom
    auxId = id + columns;
    if (frameGrid.get(auxId).get('color') === color) {
      adjacentCollection.push(auxId);
    }
  }

  return adjacentCollection;
}

export function applyBucket(state, activeFrameIndex, id, sourceColor) {
  const columns = state.getIn(['currentProject', 'columns']);
  const rows = state.getIn(['currentProject', 'rows']);
  const queue = [id];
  let currentColor = state.get('currentColor').get('color');
  let currentId;
  let newState = state;
  let adjacents;
  let auxAdjacentId;
  let auxAdjacentColor;

  if (!currentColor) {
    // If there is no color selected in the palette, it will choose the first one
    currentColor = newState.getIn(['currentProject', 'palette', 0, 'color']);
    newState = newState.set('currentColor', Map({ color: currentColor, position: 0 }));
  }

  while (queue.length > 0) {
    currentId = queue.shift();
    newState = setGridCellValue(newState, currentColor, true, currentId);
    adjacents = getSameColorAdjacentCells(
      newState.getIn(
        ['currentProject', 'frames', activeFrameIndex, 'pixels']
      ),
      columns, rows, currentId, sourceColor
    );

    for (let i = 0; i < adjacents.length; i++) {
      auxAdjacentId = adjacents[i];
      auxAdjacentColor = newState.getIn(
        ['currentProject', 'frames', activeFrameIndex, 'pixels', auxAdjacentId, 'color']
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
