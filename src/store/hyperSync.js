import hypercore from 'hypercore'
import swarm from 'hyperdiscovery'
import whenChanged from './whenChanged'
import ram from 'random-access-memory'
import { deserializeProject } from '../utils/serialization';

export default store => {
  const {dispatch} = store
  const feeds = {}
  const clientId = +(process.env.CLIENT_ID || 1)
  const port = 3282 + clientId

  whenChanged(store, ['currentProject'], project => {
    const id = project.get('id')
    if (!id) return

    const key = project.get('key')
    const userData = JSON.stringify({
      name: `client id ${clientId}`,
    })

    console.log('project.key', key)

    if (feeds[id]) {
      append(feeds[id], project.toJS())
    } else {
      const feed = feeds[id] = hypercore(`./.data/pixelpusher/${clientId}/${id}`, key, {
        valueEncoding: 'json',
      })

      feed.on('ready', () => {
        const key = feed.key.toString('hex')
        const selfId = feed.id

        dispatch({type: 'REPLICATION_STARTED', key})

        feed.on('sync', () => {
          feed.head((err, data) => {
            const project = deserializeProject(data)
            dispatch({type: 'REMOTE_PROJECT_UPDATED', project})
          })
        })

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
  })
}

const append = (feed, data) => {
  if (feed.writable) {
    console.log('appending to feed')
    feed.append(data)
  }
}
