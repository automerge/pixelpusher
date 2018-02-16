import React from 'react'
import { connect } from 'react-redux'
import { getProject } from '../store/reducers/reducerHelpers'
import { shortcut } from '../logic/Keyboard'

class Title extends React.Component {
  shouldComponentUpdate (nextProps) {
    const {props, input} = this

    if (!input) return true

    if (nextProps.isMerging) return true

    if (nextProps.title === input.textContent) {
      return false
    }

    return true
  }

  render () {
    const {title, isMerging} = this.props

    if (isMerging) {
      return (
        <h1 style={{textAlign: 'center', fontSize: 20, color: '#FF9800'}}>
          Merge Preview
        </h1>
      )
    }

    return (
      <h1
        style={{textAlign: 'center', fontSize: 20}}
        onInput={this.titleChanged}
        onKeyDown={this.keyDown}
        contentEditable
        ref={el => this.input = el}
        dangerouslySetInnerHTML={{__html: title}}
      />
    )
  }

  titleChanged = e => {
    e.stopPropagation()

    const title = e.target.textContent || ""

    this.props.dispatch({type: 'PROJECT_TITLE_CHANGED', title})
  }

  keyDown = e => {
    switch (shortcut(e)) {
      case 'Enter':
        e.preventDefault()
        e.target.blur()
    }
  }
}

const mapStateToProps = (state) => {
  const project = getProject(state)
  const title = project ? project.getIn(['doc', 'title'], '') : ''

  return {
    title,
    isMerging: state.mergeSrcId && state.mergeDstId
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch
})

const TitleContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Title)

export default TitleContainer
