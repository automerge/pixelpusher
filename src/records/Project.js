import {Record} from 'immutable'

const Project = Record({
  id: null, // required
  doc: null,
  isWritable: false
}, 'Project')

export default Project

export const project = () =>
  Project({})
