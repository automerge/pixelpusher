import React from 'react'
import { connect } from 'react-redux';

import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId } from '../store/reducers/reducerHelpers';
import Field from './Field';
import Preview from './Preview';

class Presence extends React.Component {
  render() {
    const {identities, projectId, projects, peerInfo, dispatch} = this.props
    if (!projectId) return null

    const peers = this.props.peers.valueSeq()
      .filter(({key}) => key === projectId)
      .sortBy(p => !p.isSelf)

    return (
      <div>
        <h3>Collaborators:</h3>
        {peers.map(peer => {

          const avatarKey = (identities.get(peer.info.identity) || {}).avatarKey
          const name = (identities.get(peer.info.identity) || {}).name

          return <div className="peer" key={peer.id} style={{
            opacity: peer.isConnected ? 1 : 0.3
          }}>
            <div className="peer__avatar">
              { avatarKey && projects.get(avatarKey)
                ? <Preview
                    animate
                    frameIndex={0}
                    duration={1}
                    project={projects.get(avatarKey).set('cellSize', 3)}
                  />
                : null}
            </div>
            <div className="peer__text">
              {peer.canEdit ? "+" : null}
              {name}
              {peer.isSelf ? " (you)" : null}
            </div>
          </div>
        })}
        <Field
          label="Your Name"
          value={peerInfo.name}
          onChange={name => dispatch({type: 'SELF_NAME_CHANGED', name})}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  identities: state.present.identities,
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
