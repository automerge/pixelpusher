import {Record, Set} from 'immutable'

const Project = Record({
  id: null, // required
  doc: null,
  isWritable: false,
  identityId: null,
  identityIds: Set(),
  relativeId: null,
  versionId: null,
  sourceId: null
}, 'Project')

export default Project

export const project = () =>
  Project({})
