import React from 'react'
import { connect } from 'react-redux';

import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId } from '../store/reducers/reducerHelpers';
import Field from './Field';
import Preview from './Preview';
import Button from './Button';

class Presence extends React.Component {
  render() {
    const {projectId, projects, peerInfo, dispatch} = this.props
    if (!projectId) return null

    const currentProject = projects.get(projectId)

    if (!currentProject) return null

    // const peers = this.props.peers.valueSeq()
    //   .filter(({key}) => key === projectId)
    //   .sortBy(p => !p.isSelf)

    const relatedProjects = projects.valueSeq().filter(project =>
      project.get('relativeId') && project.get('relativeId') === currentProject.get('relativeId'))
      .sortBy(project => [project !== currentProject, project._actorId])

    return (
      <div>
        <h3>Versions:</h3>
        {relatedProjects.map(project =>
          <div
            className="peer"
            onClick={this.openProject(project._actorId)}
            key={project._actorId}
            style={{
              // opacity: peer.isConnected ? 1 : 0.3
            }}
          >
            <div className="peer__avatar">
              { project
                ? <Preview
                    animate
                    frameIndex={0}
                    duration={1}
                    project={project.set('cellSize', 3)}
                  />
                : null}
            </div>
            <div className="peer__text">

              { currentProject === project
                ? null
                : <Button tiny icon="merge" onClick={this.mergeProject(project._actorId)} /> }
            </div>
          </div>
        )}
        <Field
          label="Your Name"
          value={peerInfo.name}
          onChange={name => dispatch({type: 'SELF_NAME_CHANGED', name})}
        />
      </div>
    )
  }

  openProject = id => e => {
    e.stopPropagation()
    this.props.dispatch({type: 'SET_PROJECT', id})
  }

  mergeProject = id => e => {
    e.stopPropagation()
    this.props.dispatch({type: 'MERGE_PROJECT_CLICKED', id})
  }
}

const mapStateToProps = state => ({
  peers: state.present.peers,
  projects: state.present.projects,
  peerInfo: state.present.peerInfo,
  projectId: getProjectId(state.present),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const PresenceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Presence);
export default PresenceContainer;
