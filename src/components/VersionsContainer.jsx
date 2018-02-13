import React, {Fragment} from 'react'
import Automerge from 'automerge'
import {List} from 'immutable'
import { connect } from 'react-redux';
import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId, getLiveProject } from '../store/reducers/reducerHelpers';
import Version from './Version';
import {relatedTree, getHistory, commonClock, clock, sort} from '../logic/Versions'
import * as Clock from '../logic/Clock'

class Versions extends React.Component {
  render() {
    const {currentProject, focusedId, projects} = this.props

    if (!(currentProject && currentProject.doc)) return null

    const tree = relatedTree(currentProject, projects)

    return (
      <div>
        <h3>Versions</h3>
        {this.renderTree(tree)}
        <div className="version version-new" onClick={this.fork}>
          + New version
        </div>
      </div>
    )
  }

  renderTree = (tree, index) => {
    return (
      <Fragment key={index}>
        {this.renderVersion(tree.value)}
        { tree.children.size > 0
          ? <div className="version__list">
              {tree.children.map(this.renderTree)}
            </div>
          : null }
      </Fragment>
    )
  }

  renderVersion = (project, index) => {
    const {dispatch, currentProject, projects, identities, liveIds} = this.props

    const identity = identities.get(project.identityId)
    const avatarId = identity && identity.doc.get('avatarId')
    const avatar = avatarId
      ? projects.get(avatarId)
      : null

    const isCurrent = currentProject.id === project.id
    const isLive = !isCurrent && liveIds.has(project.id)

    return (
      <Version
        key={project.id}
        dispatch={dispatch}
        currentProject={currentProject}
        isCurrent={isCurrent}
        isLive={isLive}
        project={project}
        identity={identity}
        avatar={avatar}
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
    const {dispatch, currentProject} = this.props
    dispatch({type: 'FORK_PROJECT', id: currentProject.id})
  }
}

const mapStateToProps = state => ({
  currentProject: getLiveProject(state),
  projects: state.projects,
  identities: state.identities,
  liveIds: state.liveIds,
  focusedId: state.get('focusedProjectId'),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const VersionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Versions);
export default VersionsContainer;
