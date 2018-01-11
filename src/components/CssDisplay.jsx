import React from 'react';
import { connect } from 'react-redux';
import { generatePixelDrawCss } from '../utils/cssParse';
import { getProject } from '../store/reducers/reducerHelpers';

const CssDisplay = (props) => {
  const generateCss = () => {
    const { activeFrame, columns, rows, cellSize } = props;

    if (!activeFrame) return null;

    let cssString = generatePixelDrawCss(
      activeFrame, columns, rows, cellSize, 'string'
    );

    if (cssString) {
      cssString = `box-shadow: ${cssString}; `;
      cssString += `height: ${cellSize}px; width: ${cellSize}px;`;
    }

    return <div>{cssString}</div>;
  };

  return (
    <div className="css-display">
      {generateCss()}
    </div>
  );
};

function mapStateToProps(state) {
  const project = getProject(state.present);

  if (!project) return {}

  const frames = project.get('frames');
  const activeFrameIndex = state.present.get('activeFrameIndex');

  return {
    activeFrame: frames.get(activeFrameIndex),
    columns: project.get('columns'),
    rows: project.get('rows'),
    cellSize: project.get('cellSize')
  };
}

const CssDisplayContainer = connect(
  mapStateToProps
)(CssDisplay);
export default CssDisplayContainer;
