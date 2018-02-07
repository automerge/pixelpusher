import React from 'react';
import {connect} from 'react-redux';
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
  dispatch,
});

const CloudPeersContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CloudPeers);
export default CloudPeersContainer;