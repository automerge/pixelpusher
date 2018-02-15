import { Map } from 'immutable'
import Automerge from 'automerge'
import shortid from 'shortid'
import { pixels as pixelList } from '../../records/Pixel'
import * as Mutation from '../../logic/Mutation'
import { related, diffCount } from '../../logic/Versions';

export const getOwnIdentity = state =>
  state.identities.get(state.identityId)

export const updateIdentity = (state, f) =>
  state.updateIn(['identities', state.identityId], f)

export const getProjectPreview = state =>
  state.mergePreviewProjectId
  ? getLiveProject(state).update('doc', doc =>
      Automerge.merge(doc, state.projects.get(state.mergePreviewProjectId).doc))
  : getLiveProject(state)

export const getLiveProject = state =>
  // TODO include mergePreviewProjectId:
  state.liveIds.toSeq()
  .filterNot(id => id === getProjectId(state))
  .map(id =>
    state.projects.get(id))
  .reduce(
    (a, b) => a.update('doc', doc => Automerge.merge(doc, b.doc)),
    getProject(state)
  )

export const getProjectId = state =>
  state.currentProjectId || state.projects.keySeq().first()

export const getProject = state =>
  state.projects.get(getProjectId(state))

export const getInProject = (state, path, value) => {
  const project = getProject(state)
  return project ? project.getIn(path) : null
}

export const getInProjectPreview = (state, path, value) => {
  const project = getProjectPreview(state)
  return project ? project.getIn(path) : null
}

export const getProjectDocument = state =>
  getProject(state).document

export const toggleFollowProject = (state, id) =>
  state.liveIds.has(id)
    ? unfollowProject(state, id)
    : followProject(state, id)

export const followProject = (state, id) =>
  state.update('liveIds', ids => ids.add(id))

export const unfollowProject = (state, id) =>
  state.update('liveIds', ids => ids.remove(id))

export const autoFollowProject = (state, project) => {
  const curr = getProject(state)

  const shouldFollow =
    project.doc &&
    curr &&
    curr.doc &&
    curr.isWritable &&
    diffCount(curr, project) <= 1

  return shouldFollow
    ? followProject(state, project.id)
    : state
}

export const autoFollowProjects = (state, project) => {
  const curr = getProject(state)
  return related(curr, state.projects).reduce(autoFollowProject, state)
}

export const addProject = (state, project) => {
  return state.setIn(['projects', project.id], project)
}

export const setProject = (state, project) =>
  addProject(state, project)
  .set('currentProjectId', project.id)
  .delete('mergePreviewProjectId')
  .delete('liveIds')

export const getCurrentSwatch = state =>
  getInProject(state, ['doc', 'palette', state.currentSwatchIndex]) || Map()

export const getCurrentColor = state =>
  getCurrentSwatch(state).get('color') || null

export const updateProject = (state, f) =>
  state.setIn(['projects', getProjectId(state)], f(getLiveProject(state)))

export function addFrameToProject (state) {
  return updateProject(state, Mutation.addFrame())
}

export function resizeProject (state, dimension, behavior) {
  return updateProject(state, Mutation.resize(dimension, behavior))
}

export function resizePixels (pixels, dimension, behavior, columns) {
  if (dimension === 'columns') {
    if (behavior === 'add') {
      const size = pixels.size

      for (let i = size; i > 0; i -= columns) {
        pixels = pixels.splice(i, 0, null)
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

export function cloneFrame (frame) {
  return frame.set('id', shortid.generate())
}

export function checkColorInPalette (palette, color) {
  const sameColors = palette.filter(swatch =>
    (swatch.get('color') === color)
  )
  return (sameColors.size > 0)
}

export function getPositionFirstMatchInPalette (palette, color) {
  return palette.reduce((acc, swatch, index) => {
    let currentPosition = acc
    if (currentPosition === -1 && swatch.get('color') === color) {
      currentPosition = index
    }
    return currentPosition
  }, -1)
}

export function addColorToLastCellInPalette (palette, newColor) {
  return palette.map((swatch, i, collection) => {
    if (i === collection.size - 1) {
      // Last cell
      return (Map({ color: newColor }))
    }
    return (Map({ color: swatch.get('color') }))
  })
}

export function resetIntervals (frames) {
  const equalPercentage = 100 / frames.size

  return frames.map((frame, index) => {
    const percentage = index ===
      frames.size - 1 ? 100 : Math.round(((index + 1) * equalPercentage) * 10) / 10

    return frame.set('interval', percentage)
  })
}

export function setGridCellValue (state, pixelIndex, colorId) {
  return updateProject(state, Mutation.setPixel(state.activeFrameIndex, pixelIndex, colorId))
}

function getSameColorAdjacentCells (pixels, columns, rows, index, sourceSwatchId) {
  const adjacentCollection = []
  let auxIndex

  if ((index + 1) % columns !== 0) {
    // Not at the very right
    auxIndex = index + 1
    if (pixels.get(auxIndex) === sourceSwatchId) {
      adjacentCollection.push(auxIndex)
    }
  }
  if (index % columns !== 0) {
    // Not at the very left
    auxIndex = index - 1
    if (pixels.get(auxIndex) === sourceSwatchId) {
      adjacentCollection.push(auxIndex)
    }
  }
  if (index >= columns) {
    // Not at the very top
    auxIndex = index - columns
    if (pixels.get(auxIndex) === sourceSwatchId) {
      adjacentCollection.push(auxIndex)
    }
  }
  if (index < (columns * rows) - columns) {
    // Not at the very bottom
    auxIndex = index + columns
    if (pixels.get(auxIndex) === sourceSwatchId) {
      adjacentCollection.push(auxIndex)
    }
  }

  return adjacentCollection
}

export function applyBucket (state, activeFrameIndex, pixelIndex, sourceSwatchId) {
  const columns = getProject(state).doc.get('columns')
  const rows = getProject(state).doc.get('rows')
  const queue = [pixelIndex]
  const currentSwatchIndex = state.currentSwatchIndex
  let currentIndex
  let newState = state
  let adjacents
  let auxAdjacentId
  let auxAdjacentSwatchIndex

  while (queue.length > 0) {
    const {doc} = getProject(newState)
    const pixels = doc.getIn(['frames', activeFrameIndex, 'pixels'])
    currentIndex = queue.shift()
    newState = setGridCellValue(newState, currentIndex, currentSwatchIndex)
    adjacents = getSameColorAdjacentCells(
      pixels, columns, rows, currentIndex, sourceSwatchId
    )

    for (let i = 0; i < adjacents.length; i++) {
      auxAdjacentId = adjacents[i]
      auxAdjacentSwatchIndex = pixels.get(auxAdjacentId)
      // Avoid introduce repeated or painted already cell into the queue
      if (
        (queue.indexOf(auxAdjacentId) === -1) &&
        (auxAdjacentSwatchIndex !== currentSwatchIndex)
      ) {
        queue.push(auxAdjacentId)
      }
    }
  }

  return newState
}

export function addCloudPeer (key) {
  return updateProject(state, Mutation.addFrame())
}

