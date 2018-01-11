import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../store/actions/actionCreators';
import GridWrapper from './GridWrapper';
import { getProject } from '../store/reducers/reducerHelpers';

const PixelCanvas = (props) => {
  const {emptyColor, activeFrame} = props;

  if (!activeFrame) return <div>Loading...</div>;

  const cells = activeFrame.get('pixels').map((color, i) => {
    return {
      id: i,
      width: 100 / props.columns,
      color: color || emptyColor,
    };
  });

  const onCellEvent = id => props.actions.drawCell(id);

  let gridExtraClass = 'cell';
  if (props.eraserOn) {
    gridExtraClass = 'context-menu';
  } else if (props.eyedropperOn) {
    gridExtraClass = 'copy';
  }

  return (
    <GridWrapper
      cells={cells}
      onCellEvent={onCellEvent}
      extraClass={gridExtraClass}
    />
  );
};

const mapStateToProps = (state) => {
  const project = getProject(state.present);

  if (!project) return {}

  const frames = project.get('frames');
  const activeFrameIndex = state.present.get('activeFrameIndex');

  return {
    activeFrame: frames.get(activeFrameIndex),
    columns: project.get('columns'),
    emptyColor: project.get('defaultColor'),
    eyedropperOn: state.present.get('eyedropperOn'),
    eraserOn: state.present.get('eraserOn')
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const PixelCanvasContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PixelCanvas);
export default PixelCanvasContainer;
