import {Record, Map} from 'immutable'

const Project = Record({
  id: null, // required
  document: null,
  isWritable: false
}, 'Project')

export default Project

export const project = () =>
  Project({})
