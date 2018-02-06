import React from 'react'
import Automerge from 'automerge'
import {List} from 'immutable'
import { connect } from 'react-redux';
import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId, getProject } from '../store/reducers/reducerHelpers';
import Version from './Version';
import {related, getHistory, commonClock, clock} from '../logic/Versions'
import * as Clock from '../logic/Clock'

class Versions extends React.Component {
  render() {
    const {currentProject, focusedId, projects} = this.props

    if (!currentProject) return null

    const relatedProjects = related(currentProject, projects)

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

  renderHistoryItem = (base, related) => ({change, snapshot}) => {
    const snapClock = clock(snapshot)

    let versions = related.get(snapClock)

    if (!versions) return null

    const seq = change.get('seq')

    // versions = versions.filterNot(p => clock(p).equals(snapClock))

    return [
      this.renderVersion(snapshot, seq),
      this.renderVersion(versions, seq)]
  }

  renderVersion = (project, index) => {
    if (List.isList(project)) return this.renderVersions(project, index)

    const {dispatch, currentProject} = this.props

    const isCurrent =
      currentProject._actorId === project._actorId
      && clock(currentProject).equals(clock(project))

    return (
      <Version
        key={project.id}
        dispatch={dispatch}
        isCurrent={isCurrent}
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
  currentProject: getProject(state),
  projects: state.projects,
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
