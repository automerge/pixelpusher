import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../store/actions/actionCreators';

const CloneProject = (props) => {
  const cloneProject = () => {
    props.actions.cloneProject();
    props.actions.sendNotification("Project cloned.");
  };

  return (
    <div className="new-project">
      <button
        onClick={() => { cloneProject(); }}
      >
        Clone
      </button>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const CloneProjectContainer = connect(
  null,
  mapDispatchToProps
)(CloneProject);
export default CloneProjectContainer;
