import React from 'react';
import { connect } from 'react-redux';

const NewProject = (props) => {
  const newProject = () => {
    props.dispatch({type: 'CREATE_DOCUMENT'});
  };

  return (
    <div className="new-project">
      <button
        onClick={newProject}
      >
        New
      </button>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({dispatch});

const NewProjectContainer = connect(
  null,
  mapDispatchToProps
)(NewProject);
export default NewProjectContainer;
