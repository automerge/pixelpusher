import React from 'react';
import { connect } from 'react-redux';

const CloneProject = (props) => {
  const cloneProject = () => {
    props.dispatch({type: 'CLONE_CURRENT_PROJECT_CLICKED'});
  };

  return (
    <div className="new-project">
      <button onClick={cloneProject}>
        Clone
      </button>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({dispatch});

const CloneProjectContainer = connect(
  null,
  mapDispatchToProps
)(CloneProject);
export default CloneProjectContainer;
