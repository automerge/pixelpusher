import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../store/actions/actionCreators';

const Reset = (props) => {
  const handleClick = () => {
    props.actions.resetGrid(
      props.columns,
      props.rows,
      props.activeFrameIndex);
  };

  return (
    <button
      className="reset"
      onClick={() => { handleClick(); }}
    >
      Reset
    </button>
  );
};

const mapStateToProps = state => ({
  columns: state.get('columns'),
  rows: state.get('rows'),
  activeFrameIndex: state.get('activeFrameIndex')
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const ResetContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Reset);
export default ResetContainer;
