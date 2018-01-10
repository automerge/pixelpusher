import {ipcRenderer} from 'electron'
import {getProjectFromStorage} from '../utils/storage'
import {keyFromShareLink} from '../utils/shareLink'
import Project from '../records/Project'

export default store => {
  ipcRenderer.on('open-url', (_, url) => {
    const id = keyFromShareLink(url)
    const project = getProjectFromStorage(localStorage, id)

    if (project) {
      store.dispatch({type: "SET_PROJECT", project})
      store.dispatch({type: "SEND_NOTIFICATION", message: "Opened project."})
    } else {
      const project = Project({id})
      store.dispatch({type: "SET_PROJECT", project})
      store.dispatch({type: "SEND_NOTIFICATION", message: "Opening project."})
    }
  })
}
