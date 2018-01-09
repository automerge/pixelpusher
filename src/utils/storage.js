import { exampleCat } from '../../examples/import-export/json-cat';
import Project from '../records/Project'
import { deserializeProject } from './serialization';

const STORAGE_KEY = 'pixelpusher-v2';

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

export function initStorage(storage) {
  const id = exampleCat.id
  const data = {
    projects: {[id]: exampleCat}, // Load an example project data by default
    currentProjectId: id,
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data
}

export function getProjectFromStorage(storage, id) {
  const data = getDataFromStorage(storage)

  if (!data) return false

  const projectData = data.projects[id]

  return projectData
    ? deserializeProject(projectData)
    : false
}

export function getProjectsFromStorage(storage) {
  const data = getDataFromStorage(storage)

  if (!data) return false

  return Object.values(data.projects).map(deserializeProject)
}

export function getCurrentProjectFromStorage(storage) {
  const data = getDataFromStorage(storage)

  if (!data) return false

  const id = data.currentProjectId || Object.keys(data.projects)[0]

  if (!id) return false

  const projectData = data.projects[id]

  return projectData
    ? deserializeProject(projectData)
    : false
}

export function saveProjectToStorage(storage, project) {
  try {
    const data = getDataFromStorage(storage) || { projects: {} };

    data.projects[project.get('id')] = project.toJS()
    data.currentProjectId = project.get('id')

    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;  // There was an error
  }
}

export function removeProjectFromStorage(storage, id) {
  const data = getDataFromStorage(storage);

  if (!data) return false

  delete data.projects[id]

  if (data.currentProjectId === id) {
    data.currentProjectId = null
  }

  return saveDataToStorage(storage, data);
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
