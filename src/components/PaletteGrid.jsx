import React from 'react';
import { connect } from 'react-redux';
import PaletteColor from './PaletteColor';
import { getProject } from '../store/reducers/reducerHelpers';

const PaletteGrid = (props) => {
  const getColors = () => {
    const { palette = [], currentSwatchIndex } = props;
    const width = 100 / 6;

    return palette.map((swatch, i) =>
      <PaletteColor
        key={i}
        position={i}
        width={width}
        color={swatch.get('color')}
        selected={currentSwatchIndex === i}
        dispatch={props.dispatch}
      />
    );
  };

  return (
    <div className="palette-grid">
      {getColors()}
    </div>
  );
};

const mapStateToProps = state => {
  const project = getProject(state);

  if (!project) return {}

  return {
    palette: project.doc.get('palette'),
    currentSwatchIndex: state.currentSwatchIndex,
  };
}

const mapDispatchToProps = dispatch => ({
  dispatch,
});

const PaletteGridContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PaletteGrid);
export default PaletteGridContainer;
