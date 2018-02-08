import React from 'react'

export default class Canvas extends React.Component {
  render () {
    const {project: {doc}} = this.props

    return (
      <canvas
        className='Canvas'
        style={{
          imageRendering: 'pixelated'
        }}
        width={doc.get('columns')}
        height={doc.get('rows')}
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
    const {project: {doc}} = this.props
    const empty = doc.get('defaultColor')
    const w = doc.get('columns')
    const h = doc.get('rows')
    const palette = doc.get('palette')
    const pixels = doc.getIn(['frames', 0, 'pixels'])

    pixels.forEach((swatchId, i) => {
      const color = palette.getIn([swatchId, 'color']) || empty
      const x = i % w
      const y = i / w | 0

      ctx.fillStyle = color
      ctx.fillRect(x, y, 1, 1)
    })
  }
}
