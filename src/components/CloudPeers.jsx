import React from 'react'

const CloudPeers = (props) => {
  return (
    <div className="cloud-peers">
      <h3>Cloud Peers</h3>
      <ul>
        <li><span class="green" />Jim's Server</li>
        <li><span class="red" />Jeff's Server</li>
      </ul>
      <button className="cloud-peers__add-button">Add Cloud Peer</button>
    </div>
  )
}

export default CloudPeers