import hypercore from 'hypercore'
import swarm from 'hyperdiscovery'

export default store => {
  const feed = hypercore('./.data/pixelpusher')

  feed.on('ready', () => {
    const sw = swarm(feed)
    const id = sw.id.toString('hex')

    store.dispatch({type: 'SELF_CONNECTED', id})

    // TODO add SELF_DISCONNECTED somehow

    sw.on('connection', (peer, type) => {
      const id = peer.id.toString('hex')

      store.dispatch({type: 'PEER_CONNECTED', id})

      peer.on('close', function () {
        store.dispatch({type: 'PEER_DISCONNECTED', id})
      })
    })
  })
}
