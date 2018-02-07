import whenChanged from './whenChanged'
import hypercore from 'hypercore'
import hyperdiscovery from 'hyperdiscovery'
import ram from 'random-access-memory'

const connectedCloudPeers = {}

export default store => {
  const {dispatch} = store

  whenChanged(store, state => state.archiverKey, archiverKey => {
    if (archiverKey) init()
  })

  function init () {
    whenChanged(store, state => state.cloudPeers, cloudPeers => {
      connectCloudPeers()
    })
  }

  function connectCloudPeers () {
    const cloudPeers = store.getState().cloudPeers.toJS()
    const archiverKey = store.getState().archiverKey
    Object.keys(cloudPeers).forEach(key => {
      if (!connectedCloudPeers[key]) {
        console.log('Cloud peer connecting...', key)
        const feed = hypercore(ram, key)
        connectedCloudPeers[key] = {
          feed
        }
        feed.ready(() => {
          const sw = hyperdiscovery(feed, {
            stream: () => feed.replicate({
              live: true,
              userData: archiverKey
            })
          })
          sw.on('connection', peer => {
            let name
            try {
              if (peer.remoteUserData) {
                const json = JSON.parse(peer.remoteUserData.toString())
                name = json.name
              }
            } catch (e) {
              console.log('Cloud peer JSON parse error')
            }
            console.log('Cloud peer connection', name)
            ping()
            const intervalId = setInterval(ping, 1000)
            peer.on('error', err => {
              console.log('Cloud peer connection error', err)
              clearInterval(intervalId)
            })
            peer.on('close', () => {
              console.log('Cloud peer connection closed')
              clearInterval(intervalId)
            })

            function ping () {
              if (!name) return
              dispatch({
                type: 'CLOUD_PEER_PING',
                key,
                name,
                timestamp: Date.now()
              })
            }
          })
        })
      }
    })
  }
}
