import {Record} from 'immutable'

const Project = Record({
  id: null, // required
  doc: null,
  isWritable: false,
  isOpening: false,
  isDeleting: false,
  isForking: false
}, 'Project')

export default Project

export const project = () =>
  Project({})
