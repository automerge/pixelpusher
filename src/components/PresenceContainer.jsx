import React from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../store/actions/actionCreators';

class Presence extends React.Component {
  render() {
    const peers = this.props.peers.valueSeq()

    return (
      <div>
        {peers.map(peer =>
          <div key={peer.id} style={{
            opacity: peer.isConnected ? 1 : 0.3
          }}>
            {peer.id.slice(0, 8)}
            {peer.isSelf ? " (you)" : null}
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  peers: state.present.get('peers'),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const PresenceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Presence);
export default PresenceContainer;
