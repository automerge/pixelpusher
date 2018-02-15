import React, {Fragment} from 'react'
import Automerge from 'automerge'
import {List} from 'immutable'
import { connect } from 'react-redux';
import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId, getLiveProject } from '../store/reducers/reducerHelpers';
import Version from './Version';
import Window from './Window';
import {isUpstream, relatedTree, getHistory, commonClock, clock, sort} from '../logic/Versions'
import * as Clock from '../logic/Clock'
import {shortcut} from '../logic/Keyboard'

class Versions extends React.Component {
  render() {
    const {currentProject, projects} = this.props

    if (!(currentProject && currentProject.doc)) return null

    const tree = relatedTree(currentProject, projects)

    return (
      <div>
        <h3>Versions</h3>
        {this.renderTree(null)(tree)}
        <Window
          onKeyDown={this.onKeyDown}
        />
      </div>
    )
  }

  renderTree = parent => (tree, index) => {
    const proj = tree.value
    const children = tree.children.map(this.renderTree(proj))

    return (
      <Fragment key={index}>
        {this.renderVersion(parent)(proj)}
        { children.size > 0
          ? <div className="version__list">
              {children}
            </div>
          : null}
      </Fragment>
    )
  }

  renderVersion = parent => (project, index) => {
    const {dispatch, currentProject, projects, identities, liveIds} = this.props

    if (parent && parent.doc && project.doc && isUpstream(parent, project)) return null

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
        isCurrent={isCurrent}
        isLive={isLive}
        parent={parent}
        project={project}
        identity={identity}
        avatar={avatar}
      />
    )
  }

  forkCurrent = e => {
    const {dispatch, currentProject} = this.props
    dispatch({type: 'FORK_PROJECT', id: currentProject.id})
  }

  onKeyDown = e => {
    switch (shortcut(e)) {
      case 'Meta+n':
        return this.forkCurrent(e)
    }
  }
}

const mapStateToProps = state => ({
  currentProject: getLiveProject(state),
  projects: state.projects,
  identities: state.identities,
  liveIds: state.liveIds,
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const VersionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Versions);
export default VersionsContainer;
