import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../store/actions/actionCreators';
import { getInProjectPreview } from '../store/reducers/reducerHelpers';

const CellSize = (props) => {
  const handleCellSizeChange = (event) => {
    props.actions.setCellSize(+event.target.value || 0);
  };

  const { cellSize } = props;

  return (
    <div className="cell-size">
      <label htmlFor="cell-size__input">
        Pixel Size
      </label>
      <input
        type="number"
        value={cellSize}
        onChange={(ev) => { handleCellSizeChange(ev); }}
        id="cell-size__input"
      />
    </div>
  );
};

const mapStateToProps = state => ({
  cellSize: getInProjectPreview(state, ['doc', 'cellSize']) || 0
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const CellSizeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CellSize);
export default CellSizeContainer;
