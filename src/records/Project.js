import {Record} from 'immutable'

const Project = Record({
  id: null, // required
  relativeId: null,
  doc: null,
  isWritable: false,
  identityId: null
}, 'Project')

export default Project

export const project = () =>
  Project({})
