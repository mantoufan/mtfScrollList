import React, { Component } from 'react'
import reactDOM from 'react-dom'
import MtfScrollList from 'mtfscrolllist'

export default class ReactMtfScrollList extends Component {
  componentDidMount () {
    const f = (prop, args) => {
      if (this.props[prop]) return this.props[prop](args)
    }
    const self = this
    this.mtfScrollList = new MtfScrollList()
    this.mtfScrollList.init({
      ele: this.el,
      data: [],
      perPage: this.props.perPage,
      style: { height: '90%' },
      render ({ data, index }) {
        const d = document.createElement('div')
        d.setAttribute('index', index)
        if (self.props.render) reactDOM.render(self.props.render({ data, index }), d)
        return d
      },
      onTop ({ cb, page }) {
        return f('onTop', { cb, page })
      },
      onBottom ({ cb, page }) {
        return f('onBottom', { cb, page })
      },
      onPullDownStart ({ startY }) {
        return f('onPullDownStart', { startY })
      },
      onPullDownMove ({ paddingTop }) {
        return f('onPullDownMove', { paddingTop })
      },
      onPullDownEnd ({ paddingTop, cb }) {
        return f('onPullDownEnd', { paddingTop, cb })
      }
    })
  }

  componentDidUpdate (preProps) {
    const data = {
      data: this.props.data,
      perPage: this.props.perPage
    }; const preData = {
      data: preProps.data,
      perPage: preProps.perPage
    }
    if (JSON.stringify(data) !== JSON.stringify(preData)) this.mtfScrollList.refresh(data)
  }

  render () {
    return <div className={this.props.className} ref={el => (this.el = el)} />
  }
}
