import React from 'react'
import {List} from 'immutable'
import { connect } from 'react-redux';
import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId } from '../store/reducers/reducerHelpers';
import Version from './Version';
import {relatedTree, clock} from '../logic/Versions'

class Versions extends React.Component {
  render() {
    const {projectId, focusedId, projects} = this.props
    if (!projectId) return null

    const currentProject = projects.get(projectId)

    if (!currentProject) return null

    const relatedProjects = relatedTree(currentProject, projects)

    return (
      <div>
        <h3>Versions</h3>
        {relatedProjects.map(this.renderVersion)}
        <div className="version version-new" onClick={this.fork}>
          + New version
        </div>
      </div>
    )
  }

  renderVersion = (project, index) => {
    if (List.isList(project)) return this.renderVersions(project, index)

    const {dispatch, viewingId, projectId} = this.props

    return (
      <Version
        key={project._actorId}
        dispatch={dispatch}
        isCurrent={projectId === project._actorId}
        isViewing={viewingId === project._actorId}
        project={project}
      />
    )
  }

  renderVersions = (versions, index) => {
    return (
      <div className="version__list" key={index}>
        {versions.map(this.renderVersion)}
      </div>
    )
  }

  fork = e => {
    this.props.dispatch({type: 'FORK_CURRENT_PROJECT_CLICKED'})
  }
}

const mapStateToProps = state => ({
  projects: state.present.projects,
  projectId: getProjectId(state.present),
  focusedId: state.present.get('focusedProjectId'),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const VersionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Versions);
export default VersionsContainer;
