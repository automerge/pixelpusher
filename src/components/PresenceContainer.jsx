import React from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../store/actions/actionCreators';

import Input from './Input';

import { shareLinkForProjectId } from '../utils/shareLink';
import { getProject } from '../store/reducers/reducerHelpers';

class Presence extends React.Component {
  render() {
    const {projectId} = this.props
    if (!projectId) return null

    const peers = this.props.peers.valueSeq().filter(({key}) => key === projectId)

    return (
      <div>
        <h3>Collaborators:</h3>
        {peers.map(peer =>
          <div data-tooltip={peer.name} key={peer.id} style={{
            opacity: peer.isConnected ? 1 : 0.3
          }}>
          {peer.canEdit ? "+" : null}
          {peer.id.slice(0, 8)}
          {peer.isSelf ? " (you)" : null}
          </div>
        )}

        <h3>Share link:</h3>
        <div style={{textAlign: 'center'}}>
          <Input readOnly autoCopy value={shareLinkForProjectId(projectId)} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  peers: state.present.get('peers'),
  projectId: getProject(state.present).get('id'),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const PresenceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Presence);
export default PresenceContainer;
