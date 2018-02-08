import React from 'react'

export default class Canvas extends React.Component {
  render () {
    const {project: {doc}} = this.props

    const width = doc && doc.get('columns') || 0
    const height = doc && doc.get('rows') || 0

    return (
      <canvas
        className='Canvas'
        style={{
          imageRendering: 'pixelated'
        }}
        width={width}
        height={height}
        ref={x => { this.canvas = x }}
      />
    )
  }

  componentDidUpdate () {
    this.draw(this.ctx)
  }

  componentDidMount () {
    this.ctx = this.canvas.getContext('2d')
    this.draw(this.ctx)
  }

  draw (ctx) {
    const {project: {doc}, frameIndex = 0} = this.props

    if (!doc) return

    const empty = doc.get('defaultColor')
    const w = doc.get('columns')
    const palette = doc.get('palette')
    const pixels = doc.getIn(['frames', frameIndex, 'pixels'])

    if (!pixels) return

    pixels.forEach((swatchId, i) => {
      const color = palette.getIn([swatchId, 'color']) || empty
      const x = i % w
      const y = i / w | 0

      ctx.fillStyle = color
      ctx.fillRect(x, y, 1, 1)
    })
  }
}
