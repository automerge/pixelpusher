import {ipcRenderer} from 'electron'
import {keyFromShareLink} from '../utils/shareLink'

export default store => {
  ipcRenderer.on('open-url', (_, url) => {
    const id = keyFromShareLink(url)

    store.dispatch({type: 'SEND_NOTIFICATION', message: "Opening project."})
    store.dispatch({type: 'SHARED_PROJECT_ID_ENTERED', id})
  })
}
