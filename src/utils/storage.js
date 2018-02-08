import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import { exampleCat } from '../../examples/import-export/json-cat'
import { deserializeState, deserializeProject, serializeState } from './serialization'
import State from '../records/State'

export const CLIENT_ID = +(process.env.CLIENT_ID || 0)
export const STORAGE_PATH = `./.data/pixelpusher-v8/client-${CLIENT_ID}`
export const STATE_PATH = path.join(STORAGE_PATH, 'state')

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

function saveDataToStorage (data) {
  fs.writeFile(
    STATE_PATH,
    JSON.stringify(data),
    e => e && console.error(e))
}

export function getDataFromStorage () {
  if (!fs.existsSync(STATE_PATH)) return initStorage()

  const contents = fs.readFileSync(STATE_PATH)

  if (contents.length === 0) return initStorage()

  return JSON.parse(contents)
}

export function saveStateToStorage (state) {
  return saveDataToStorage(serializeState(state))
}

export function getStateFromStorage () {
  const data = getDataFromStorage()
  return data ? deserializeState(data) : State()
}

export function initStorage () {
  const data = serializeState(State())

  mkdirp.sync(STORAGE_PATH)

  saveDataToStorage(data)

  return data
}

export function generateExportString (project) {
  try {
    return JSON.stringify(project.toJS())
  } catch (e) {
    return 'Sorry, there was an error'
  }
}

export function exportedStringToProject (str) {
  if (str === '') {
    return false
  }
  try {
    return deserializeProject(JSON.parse(str))
  } catch (e) {
    return false
  }
}
