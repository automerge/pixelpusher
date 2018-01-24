import React from 'react'
import { connect } from 'react-redux';
import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId } from '../store/reducers/reducerHelpers';
import Version from './Version';
import {related} from '../logic/Versions'

class Versions extends React.Component {
  render() {
    const {projectId, projects, dispatch} = this.props
    if (!projectId) return null

    const currentProject = projects.get(projectId)

    if (!currentProject) return null

    const relatedProjects = related(currentProject.get('relativeId'), projects.valueSeq())

    return (
      <div>
        <h3>Versions:</h3>
        {relatedProjects.map(project =>
          <Version
            key={project._actorId}
            dispatch={dispatch}
            currentProject={currentProject}
            project={project}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  projects: state.present.projects,
  projectId: getProjectId(state.present),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const VersionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Versions);
export default VersionsContainer;
