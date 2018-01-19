import React from 'react'
import { connect } from 'react-redux'
import Field from './Field'

import * as Pixels from '../logic/Pixels'

class ImportImage extends React.Component {
  render() {
    return (
      <Field
        label="Import Image"
        type="file"
        onChange={this.importImage}
      />
    )
  }

  importImage = (_, e) => {
    const input = e.target
    if (!input.files || !input.files[0]) return

    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image()
      img.onload = () => this.readImage(img)
      img.src = e.target.result
    }

    reader.readAsDataURL(input.files[0]);
  }

  readImage = img => {
    const pixels = Pixels.getPixels(img)
    const {width, height} = img

    this.props.dispatch({type: 'PIXELS_IMPORTED', pixels, width, height})
  }
}

const mapDispatchToProps = dispatch => ({dispatch});

const ImportImageContainer = connect(
  null,
  mapDispatchToProps
)(ImportImage);

export default ImportImageContainer;

