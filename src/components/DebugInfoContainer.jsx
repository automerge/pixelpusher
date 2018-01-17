import React from 'react'
import { connect } from 'react-redux';
import * as actionCreators from '../store/actions/actionCreators';

import { shareLinkForProjectId } from '../utils/shareLink';
import { getProjectId } from '../store/reducers/reducerHelpers';

class DebugInfo extends React.Component {
  render() {
    const {state} = this.props

    return (
      <pre>
        Debug:<br /><br />

        currentProjectId:<br />
        {state.currentProjectId}
      </pre>
    )
  }
}

const mapStateToProps = state => ({
  state: state.present,
});

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const DebugInfoContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DebugInfo);
export default DebugInfoContainer;
