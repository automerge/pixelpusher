import React from 'react';
import { connect } from 'react-redux';
import Picker from 'react-color';
import { getCurrentColor } from '../store/reducers/reducerHelpers';

class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
    };
  }

  handleClick() {
    this.props.dispatch({type: 'SET_COLOR_PICKER'});

    if (!this.state.displayColorPicker) {
      this.setState({ displayColorPicker: !this.state.displayColorPicker });
    }
  }

  handleChange(color) {
    this.props.dispatch({type: 'SET_SWATCH_COLOR', color: color.hex})
  }

  handleClose() {
    this.setState({ displayColorPicker: false });
  }

  render() {
    /* Necessary inline styles for react-color component */
    const styles = {
      picker: {
        position: 'relative',
        bottom: '9em'
      },
      popover: {
        position: 'absolute',
        zIndex: '2',
        right: -250,
        top: 155
      },
      cover: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    };

    const isSelected = this.props.colorPickerOn && this.state.displayColorPicker;

    return (
      <div className="color-picker">
        <button
          className={`color-picker__button${isSelected ? ' selected' : ''}`}
          onClick={() => { this.handleClick(); }}
        />
        <div style={styles.picker}>
          {this.state.displayColorPicker ?
            <div style={styles.popover} is="popover">
              <div style={styles.cover} is="cover" onClick={() => { this.handleClose(); }} />
              <Picker
                color={this.props.currentColor}
                onChange={(color) => { this.handleChange(color); }}
                onClose={() => { this.handleClose(); }}
                type="sketch"
              />
            </div>
              : null
             }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  colorPickerOn: state.get('colorPickerOn'),
  currentColor: getCurrentColor(state) || '#000',
});

const mapDispatchToProps = dispatch => ({
  dispatch
});

const ColorPickerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ColorPicker);
export default ColorPickerContainer;
