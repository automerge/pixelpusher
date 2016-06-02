import React from 'react';
import { connect } from 'react-redux';
import { shareDrawing } from '../utils/helpers';
import * as actionCreators from '../action_creators';
import { saveProjectToStorage, getDataFromStorage } from '../utils/storage';

export class TwitterForm extends React.Component {
  constructor(props) {
    super(props);
    const initialText = 'made with http://goo.gl/73F1JR by @sprawlWalker #pixelart';
    this.state = {
      charsLeft: props.maxChars - initialText.length,
      initialText
    };
  }

  handleTextChange(event) {
    const input = event.target.value;
    this.setState({ charsLeft: this.props.maxChars - input.length });
  }

  tweetDrawing(type) {
    if (this.state.charsLeft >= 0) {
      const {
        frames, activeFrame, paletteGridData,
        columns, rows, cellSize, duration
      } = this.props;

      // Store current drawing in the storage
      const drawingToSave = {
        frames,
        paletteGridData,
        cellSize,
        columns,
        rows,
        animate: frames.size > 1
      };
      if (saveProjectToStorage(localStorage, drawingToSave)) {
        this.props.showSpinner();
        shareDrawing(
          {
            type,
            frames,
            activeFrame,
            columns,
            rows,
            cellSize,
            duration
          },
          this.refs.tweetText.value,
          'twitter'
        );
      } else {
        this.props.sendNotification('Sorry: There was an error :(');
      }
    }
  }

  render() {
    return (
      <div className="twitter-form">
        <h2>
          You are about to share your awesome drawing on Twitter
        </h2>
        <textarea
          ref="tweetText"
          onChange={(event) => { this.handleTextChange(event); }}
          defaultValue={this.state.initialText}
        >
        </textarea>
        <div
          className={
            `twitter-form__count
            ${this.state.charsLeft < 0 ? ' max-reached' : ''}`
          }
        >
          {this.state.charsLeft}
        </div>
        <h3>
          Please customize your message above,
          the drawing will be automatically included
        </h3>
        <button
          className="twitter-form__tweet"
          onClick={() => { this.tweetDrawing(this.props.tweetType); }}
        >
          <span></span>TWEET
        </button>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}
export const TwitterFormContainer = connect(
  mapStateToProps,
  actionCreators
)(TwitterForm);