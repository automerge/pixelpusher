import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../store/actions/actionCreators';
import PaletteColor from './PaletteColor';
import { getProject } from '../store/reducers/reducerHelpers';

const PaletteGrid = (props) => {
  const getColors = () => {
    const { palette, currentColor } = props;
    const width = 100 / 6;

    return palette.map((color, i) =>
      <PaletteColor
        key={i}
        positionInPalette={i}
        width={width}
        color={color.get('color')}
        selected={currentColor.get('position') === i}
        actions={{ setColorSelected: props.actions.setColorSelected }}
      />
    );
  };

  return (
    <div className="palette-grid">
      {getColors()}
    </div>
  );
};

const mapStateToProps = state => ({
  palette: getProject(state.present).get('palette'),
  currentColor: state.present.get('currentColor')
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const PaletteGridContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PaletteGrid);
export default PaletteGridContainer;
