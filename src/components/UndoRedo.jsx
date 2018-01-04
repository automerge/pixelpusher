import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../store/actions/actionCreators';
import {shortcut} from '../logic/Keyboard';
import Window from './Window'

const UndoRedo = (props) => {
  const undo = () => {
    props.actions.undo();
  };

  const redo = () => {
    props.actions.redo();
  };

  const keyDown = e => {
    if (e.repeat) return;

    switch (shortcut(e)) {
      case 'Meta+z':
        undo();
        break;
      case 'Meta+Z':
        redo();
        break;
      default:
        return
    }

    e.preventDefault()
  }


  return (
    <div className="undo-redo">
      <Window onKeyDown={keyDown} />

      <button
        onClick={() => { undo(); }}
      >
        <span className="undo-redo__icon--undo" />
      </button>
      <button
        onClick={() => { redo(); }}
      >
        <span className="undo-redo__icon--redo" />
      </button>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const UndoRedoContainer = connect(
  null,
  mapDispatchToProps
)(UndoRedo);
export default UndoRedoContainer;
