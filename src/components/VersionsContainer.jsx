import React, {Fragment} from 'react'
import Automerge from 'automerge'
import {List} from 'immutable'
import { connect } from 'react-redux';
import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId, getProject } from '../store/reducers/reducerHelpers';
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
    const {dispatch, currentProject, projects, mergeDstId, mergeSrcId} = this.props

    if (parent && parent.doc && project.doc && isUpstream(parent, project)) return null

    const isCurrent = currentProject.id === project.id

    return (
      <Version
        key={project.id}
        dispatch={dispatch}
        isCurrent={isCurrent}
        mergeDstId={mergeDstId}
        mergeSrcId={mergeSrcId}
        parent={parent}
        project={project}
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
  currentProject: getProject(state),
  projects: state.projects,
  mergeDstId: state.mergeDstId,
  mergeSrcId: state.mergeSrcId
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const VersionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Versions);
export default VersionsContainer;
