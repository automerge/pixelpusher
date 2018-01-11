import { exampleCat } from '../../examples/import-export/json-cat';
import { deserializeState, serializeState } from './serialization';
import State from '../records/State'

const STORAGE_KEY = 'pixelpusher-v3';

/*
 *  Storage data structure
 *
 *  {
 *   projects: {
 *     [id]: { id, frames, palette, cellSize, columns, rows},
 *     [id]: { id, frames, palette, cellSize, columns, rows},
 *     ...
 *   ]
 *   currentProjectId: position
 *  }
 *
*/

function saveDataToStorage(storage, data) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false; // There was an error
  }
}

export function getDataFromStorage(storage) {
  const dataString = storage.getItem(STORAGE_KEY);
  return dataString ? JSON.parse(dataString) : initStorage(storage);
}

export function saveStateToStorage(storage, state) {
  return saveDataToStorage(storage, serializeState(state))
}

export function getStateFromStorage(storage) {
  const data = getDataFromStorage(storage)
  return data && deserializeState(data)
}

export function initStorage(storage) {
  const data = serializeState(State())

  storage.setItem(STORAGE_KEY, JSON.stringify(data));

  return data
}

export function generateExportString(project) {
  try {
    return JSON.stringify(project.toJS());
  } catch (e) {
    return 'Sorry, there was an error';
  }
}

export function exportedStringToProject(str) {
  if (str === '') {
    return false;
  }
  try {
    return deserializeProject(JSON.parse(str));
  } catch (e) {
    return false;
  }
}
