import * as actionCreators from '../store/actions/actionCreators';
import { getCurrentProjectFromStorage } from './storage';

/*
  Initial actions to dispatch:
  1. Hide spinner
  2. Load a project if there is a current one
*/
const initialSetup = (dispatch, storage) => {
  dispatch(actionCreators.hideSpinner());

  // const project = getCurrentProjectFromStorage(storage);

  // if (project) {
  //   dispatch(actionCreators.setProject(project));
  // }
};

export default initialSetup;
