import whenChanged from './whenChanged'

export default store => {
  const {dispatch} = store

  const init = sync => {
    sync.on('merge:listening', merge => {
      const key = merge.key.toString('hex')
      const id = (merge.local || merge.source).id.toString('hex')

      dispatch({type: 'SELF_CONNECTED', key, id})
    })

    sync.on('merge:joined', (merge, {id, info}) => {
      const key = merge.key.toString('hex')
      dispatch({type: 'PEER_CONNECTED', key, id, info})

      const {avatarKey, identity} = info.peerInfo || {}
      if (avatarKey) sync.openDocument(avatarKey)
      if (identity) _identities.push(sync.openDocument(identity).key.toString('hex'))
    })

    sync.on('merge:left', (merge, {id}) => {
      const key = merge.key.toString('hex')
      dispatch({type: 'PEER_DISCONNECTED', key, id})
    })
  }
}
