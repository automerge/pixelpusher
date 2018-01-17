import React from 'react';
import PixelCell from './PixelCell';
import Window from './Window';

const PixelGrid = ({
  cells, onMouseUp, onMouseDown, onMouseOver, onTouchMove, extraClass,
  emptyColor,
}) => (
  <div className={`grid-container ${extraClass}`}>
    <Window onMouseUp={onMouseUp} />

    {cells.map(cell => (
      <PixelCell
        key={cell.id}
        cell={cell}
        id={cell.id}
        onMouseDown={(id, ev) => onMouseDown(id, ev)}
        onMouseOver={(id, ev) => onMouseOver(id, ev)}
        onTouchMove={(id, ev) => onTouchMove(id, ev)}
      />
    ))}
  </div>
);
export default PixelGrid;
