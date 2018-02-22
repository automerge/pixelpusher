import {Record, Set} from 'immutable'

const Project = Record({
  id: null, // required
  doc: null,
  isWritable: false,
  identityIds: Set(),
  groupId: null,
  versionId: null,
  parentId: null
}, 'Project')

export default Project

export const project = () =>
  Project({})
