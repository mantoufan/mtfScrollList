const removeChild = (d) => d && d.parentNode && d.parentNode.removeChild(d)
require(['../dist/mtfscrolllist'], function (module) {
  const MtfScrollList = module.default
  const mtfScrollList = new MtfScrollList()
  mtfScrollList.init({
    ele: document.getElementById('scrolllist'),
    data,
    render ({ data, index }) {
      const d = document.createElement('div')
      d.setAttribute('index', index)
      d.id = 'id' + index
      d.innerHTML = data
      return d
    },
    onBottom ({ cb }) {
      setTimeout(() => {
        cb(data)
      }, 0)
    },
    onPullDownStart ({ startY }) {
      let d = document.getElementById('tip')
      removeChild(d)
      d = document.createElement('div')
      d.className = 'tip'
      d.innerHTML = '下拉刷新'
      d.id = 'tip'
      document.body.appendChild(d)
    },
    onPullDownMove ({ paddingTop }) {
      const d = document.getElementById('tip')
      if (paddingTop < 50) d.innerHTML = '您已下拉' + paddingTop
      else if (paddingTop > 100) return true // 禁止继续下拉
      else d.innerHTML = '松开刷新'
      d.style.marginTop = (paddingTop >> 1) + 'px'
    },
    onPullDownEnd ({ paddingTop, cb }) {
      const d = document.getElementById('tip')
      if (paddingTop >= 50) {
        d.innerHTML = '开始为您刷新'
        setTimeout(() => {
          removeChild(d)
          cb(data)
        }, 1500)
      } else {
        removeChild(d)
      }
    }
  })
})
