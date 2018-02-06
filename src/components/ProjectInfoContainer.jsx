import React from 'react'
import { connect } from 'react-redux'

import Field from './Field'
import { getProject } from '../store/reducers/reducerHelpers';

const ProjectInfo = ({project, dispatch}) => {
  if (!project) return null

  return (
    <div>
      <Field
        label="Project Title"
        value={project.doc.get('title') || ""}
        onChange={title => dispatch({type: 'PROJECT_TITLE_CHANGED', title})}
      />
    </div>
  )
};

const mapDispatchToProps = dispatch => ({dispatch});

const mapStateToProps = state => ({
  project: getProject(state)
})

const ProjectInfoContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectInfo)
export default ProjectInfoContainer
