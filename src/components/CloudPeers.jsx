import React from 'react'
import {connect} from 'react-redux';
import prettyHash from 'pretty-hash';

const CloudPeers = (props) => {
  const {cloudPeers} = props
  return (
    <div className="cloud-peers">
      <h3>Cloud Peers</h3>
      <ul>
        {cloudPeers.entrySeq().map(([key, value]) => {
          return (
            <li key={key}>
              <span className="green" />
              {prettyHash(key)}
            </li>
          )
        })}
      </ul>
      <button className="cloud-peers__add-button"
              onClick={props.onAdd}>
        Add Cloud Peer
      </button>
    </div>
  )
}

const mapStateToProps = state => ({
  cloudPeers: state.cloudPeers
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const CloudPeersContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CloudPeers);
export default CloudPeersContainer;