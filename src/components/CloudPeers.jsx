import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Button from './Button';
import * as actionCreators from '../store/actions/actionCreators';
import prettyHash from 'pretty-hash';

class CloudPeers extends React.Component {
  state = {
    timer: null,
    counter: 0
  };

  componentDidMount() {
    let timer = setInterval(this.tick.bind(this), 1000);
    this.setState({timer});
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  tick () {
    this.setState({time: Date.now()})
  }

  link (key) {
    console.log('Jim link', key)
  }

  remove (key) {
    this.props.actions.removeCloudPeer(key)
  }

  render () {
    const {cloudPeers, onAdd} = this.props
    return (
      <div className="cloud-peers">
        <h3>Archivers</h3>
          <button className="cloud-peers__add-button"
                  onClick={onAdd}>
            +
          </button>
        <ul>
          {cloudPeers.entrySeq().map(([key, value]) => {
            const name = value && value.name
            const timestamp = value && value.timestamp
            const color = timestamp > Date.now() - 2000 ? 'green' : 'red'
            return (
              <li key={key}>
                <span className={color} />
                {name ? name : prettyHash(key)}
                <div className="cloud-peers__buttons">
                  <Button tiny
                    icon="link"
                    onClick={this.link.bind(this, key)}
                  />
                  <Button tiny
                    icon="delete"
                    onClick={this.remove.bind(this, key)}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  cloudPeers: state.cloudPeers
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch),
  dispatch,
});

const CloudPeersContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CloudPeers);
export default CloudPeersContainer;