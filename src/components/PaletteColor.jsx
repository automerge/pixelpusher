import React from 'react';

const PaletteColor = (props) => {
  const { position, width, color, selected, dispatch } = props;

  const handleClick = () => {
    dispatch({type: 'SWATCH_CLICKED', index: position})
  };

  const cellColor = color;
  const styles = {
    width: `${width}%`,
    paddingBottom: `${width}%`,
    backgroundColor: cellColor
  };

  return (
    <button
      className={
        `palette-color
        ${selected ? 'selected' : ''}`
      }
      style={styles}
      onClick={() => { handleClick(); }}
    />
  );
};

export default PaletteColor;
