import {keyPair} from 'hypercore/lib/crypto'
import hypercore from 'hypercore'
import swarm from 'hyperdiscovery'
import whenChanged from './whenChanged'
import { deserializeProject } from '../utils/serialization';
import {getProject} from '../store/reducers/reducerHelpers'
import Project from '../records/Project'

const MAX_LOCAL_CLIENTS = 5

const clientId = +(process.env.CLIENT_ID || 1)
let currentPort = 3282 + clientId

export default store => {
  const {dispatch} = store
  const feeds = {}

  whenChanged(store, state => state.creatingProject, shouldCreate => {
    if (!shouldCreate) return

    const keys = keyPair()

    const project = Project({
      id: keys.publicKey.toString('hex'),
    })

    addFeedForProject(feeds, dispatch, project, keys.secretKey)

    dispatch({type: "PROJECT_CREATED", project})
  })

  whenChanged(store, state => state.clonedProjectId, id => {
    if (!id) return

    const originalProject = store.getState().present.projects.get(id)

    const keys = keyPair()

    const project = originalProject.merge({
      id: keys.publicKey.toString('hex'),
    })

    addFeedForProject(feeds, dispatch, project, keys.secretKey)

    dispatch({type: "PROJECT_CLONED", project})
  })

  whenChanged(store, getProject, project => {
    const key = project.get('id')

    if (feeds[key]) {
      append(feeds[key], project.toJS())
    } else {
      addFeedForProject(feeds, dispatch, project)
    }
  })
}

const addFeedForProject = (feeds, dispatch, project, secretKey) => {
  const key = project.get('id')

  const userData = JSON.stringify({
    name: `client id ${clientId}`,
  })

  const feed = feeds[key] = hypercore(`./.data/pixelpusher/${clientId}/${key}`, key, {
    valueEncoding: 'json',
    secretKey,
  })

  feed.on('ready', () => {
    const selfId = feed.id

    feed.on('sync', () => {
      feed.head((err, data) => {
        const project = deserializeProject(data)
        dispatch({type: 'REMOTE_PROJECT_UPDATED', project})
      })
    })

    const port = currentPort
    currentPort += MAX_LOCAL_CLIENTS

    const sw = swarm(feed, {
      port,
      stream: _peer =>
        feed.replicate({
          live: true,
          upload: true,
          download: true,
          userData,
        }),
    })

    sw.on('listening', () => {
      dispatch({type: 'SELF_CONNECTED', key, id: selfId.toString('hex'), writable: feed.writable})
    })

    sw.on('connection', (conn, type) => {
      const id = conn.remoteId.toString('hex')
      const info = JSON.parse(conn.remoteUserData)

      dispatch({type: 'PEER_CONNECTED', key, id, info})

      conn.on('close', () => {
        dispatch({type: 'PEER_DISCONNECTED', key, id})
      })
    })

    sw.on('error', err => {
      console.error('Discovery error', err)
    })
  })
}

const append = (feed, data) => {
  if (feed.writable) {
    console.log('appending to feed')
    feed.append(data)
  }
}
