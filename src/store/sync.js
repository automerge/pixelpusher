import whenChanged from './whenChanged'

export default store => {
  const {dispatch} = store

  const init = sync => {
    whenChanged(store, state => state.peerInfo, info => {
      sync.peerInfo = info.toJS()
    })

    whenChanged(store, state => state.projects, projects => {
      projects.forEach(project => {

      })
    })

    sync.on('merge:listening', merge => {
      const key = merge.key.toString('hex')
      const id = (merge.local || merge.source).id.toString('hex')

      dispatch({type: 'SELF_CONNECTED', key, id})
    })

    sync.on('merge:joined', (merge, {id, info}) => {
      const key = merge.key.toString('hex')
      dispatch({type: 'PEER_CONNECTED', key, id, info})

      const {avatarKey} = info.peerInfo || {}
      if (avatarKey) sync.openDocument(avatarKey)
    })

    sync.on('merge:left', (merge, {id}) => {
      const key = merge.key.toString('hex')
      dispatch({type: 'PEER_DISCONNECTED', key, id})
    })
  }
}
