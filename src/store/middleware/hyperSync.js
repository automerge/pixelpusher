import hypercore from 'hypercore'
import swarm from 'hyperdiscovery'
import disc from 'discovery-swarm'
import crypto from 'crypto'

const KEY = Buffer.from("9842ee25ae3fb2fa9295024811fcf6fe7eede99969491a690081d9a6d2b25245", 'hex')

export default ({subscribe, getState, dispatch}) => {

  // discovery-swarm

  const selfId = crypto.randomBytes(32)

  const sw = disc(({
    id: selfId,
  }))

  sw.listen(3282 + (Math.random() * 100 | 0))
  sw.join('pixelpusher-v1')

  sw.on('listening', () => {
    dispatch({type: 'PEER_CONNECTED', id: selfId.toString('hex'), isSelf: true})
  })

  sw.on('connection', (conn, peer) => {
    console.log('peer', peer)
    const id = peer.id.toString('hex')
    const isSelf = id === selfId.toString('hex')

    dispatch({type: 'PEER_CONNECTED', id, isSelf})

    conn.on('close', () => {
      dispatch({type: 'PEER_DISCONNECTED', id})
    })
  })

  // hyperdiscovery
  // const feed = hypercore('./.data/pixelpusher', KEY)

  // feed.on('ready', () => {
  //   const selfId = feed.id.toString('hex')
  //   const sw = swarm(feed)
  //   const id = sw.id.toString('hex')
  //   console.log('discoveryKey', feed.discoveryKey.toString('hex'))

  //   sw.on('connection', (peer, type) => {
  //     const id = peer.id.toString('hex')

  //     dispatch({type: 'PEER_CONNECTED', id, isSelf: id === selfId})

  //     peer.on('close', () => {
  //       dispatch({type: 'PEER_DISCONNECTED', id})
  //     })
  //   })

  //   sw.on('error', err => {
  //     console.error('Discovery error', err)
  //   })
  // })

  return next => action => {
    switch (action.type) {
      default:
        return next(action);
    }
  }
}
