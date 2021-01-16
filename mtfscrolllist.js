let G = Object.create(null)
const init = ({ ele = null, data = [], render = () => document.createElement('div'), perPage = data.length, onTop = () => {}, onBottom = () => {}, onPullDownStart = () => {}, onPullDownMove = () => {}, onPullDownEnd = () => {} }) => {
  G = { ele, tpl: ele.innerText, render, startIndex: 0, perPage, onTop, onBottom, onPullDownStart, onPullDownMove, onPullDownEnd }
  refresh(data)
  pullDownListener()
}
class CacheHeightStack {
  constructor () {
    this.stack = []
    this.height = 0
  }

  isEmpty () {
    return this.stack.length === 0
  }

  push ({ ele, height }) {
    this.height += height || 0
    return this.stack.push({ ele, height })
  }

  front () {
    return this.stack[this.stack.length - 1]
  }

  pop () {
    const r = this.stack.pop()
    this.height -= r.height || 0
    return r
  }
}
const Dom = {
  cache: { top: new CacheHeightStack(), bottom: new CacheHeightStack() },
  paddingTop (top) {
    if (top) G.ele.style.paddingTop = top + 'px'
    if (top === 0) return G.ele.style.removeProperty('padding-top')
    return top || parseInt(G.ele.style.paddingTop) || 0
  },
  firstChildPaddingTop (top) {
    if (top === 0) return G.ele.firstChild.style.removeProperty('padding-top')
    G.ele.firstChild.style.paddingTop = top !== undefined ? top : Dom.cache.top.height + 'px'
  },
  lastChildPaddingBottom (bottom) {
    if (bottom === 0) return G.ele.lastChild.style.removeProperty('padding-bottom')
    G.ele.lastChild.style.paddingBottom = bottom !== undefined ? bottom : Dom.cache.bottom.height + 'px'
  },
  height (ele) {
    const styles = ele.currentStyle || window.getComputedStyle(ele)
    return ele.offsetHeight + parseInt(styles.marginTop | 0) + parseInt(styles.marginBottom | 0)
  },
  prepend (data) {
    const firstChild = G.ele.firstChild
    data.forEach(data => G.ele.insertBefore(G.render(data, G.startIndex++), firstChild))
  },
  prependFromCache () {
    const firstChild = G.ele.firstChild; const prev = Dom.cache.top.pop()
    if (prev) {
      Dom.firstChildPaddingTop(0)
      prev.ele.forEach(ele => G.ele.insertBefore(ele, firstChild))
      Dom.firstChildPaddingTop()
    }
  },
  append (data) {
    data.forEach(data => G.ele.appendChild(G.render(data, G.startIndex++)))
  },
  appendFromCache () {
    const last = Dom.cache.bottom.pop()
    if (last) {
      Dom.lastChildPaddingBottom(0)
      last.ele.forEach(ele => G.ele.appendChild(ele))
      Dom.lastChildPaddingBottom()
    }
  },
  clearTop () {
    if (G.ele.children.length > G.perPage) {
      Dom.firstChildPaddingTop(0)
      let i = -1; const ele = Array(G.perPage); let height = 0
      while (++i < G.perPage) {
        height += Dom.height(ele[i] = G.ele.children[0])
        G.ele.removeChild(ele[i])
      }
      Dom.cache.top.push({ ele, height })
      Dom.firstChildPaddingTop()
    }
  },
  clearBottom () {
    if (G.ele.children.length > G.perPage) {
      Dom.lastChildPaddingBottom(0)
      let i = G.perPage; const ele = Array(G.perPage); let height = 0
      while (i--) {
        height += Dom.height(ele[i] = G.ele.children[G.ele.children.length - 1])
        G.ele.removeChild(ele[i])
      }
      Dom.cache.bottom.push({ ele, height })
      Dom.lastChildPaddingBottom()
    }
  },
  clear () {
    G.ele.innerHTML = ''
  }
}
/**
 * 节流或防抖
 * @param {Function} fn 要节流的函数
 * @param {Integer} wait 多少毫秒执行一次
 * @param {Boolean} debounce 是否开启防抖
 */
const throttle = (fn, wait, debounce) => {
  let timer = null
  return function (...args) {
    debounce && timer && (clearTimeout(timer) || (timer = null))
    !timer && (timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, wait))
  }
}
/** 监听滚动事件 */
const scrollListener = () => {
  const topDom = (cb = () => {}) => {
    Dom.clearBottom()
    if (Dom.cache.top.isEmpty()) {
      G.onTop(data => {
        if (data) {
          Dom.prepend(data)
          cb(data)
        }
      })
    } else { Dom.prependFromCache() }
    cb()
  }
  const bottomDom = (cb = () => {}) => {
    Dom.clearTop()
    if (Dom.cache.bottom.isEmpty()) {
      G.onBottom(data => {
        if (data) {
          Dom.append(data)
          cb(data)
        }
      })
    } else { Dom.appendFromCache() }
    cb()
  }
  if (typeof IntersectionObserver === 'undefined') {
    const rect = G.ele.getBoundingClientRect()
    G.ele.addEventListener('scroll', throttle(() => {
      const firstChild = G.ele.firstChild
      const lastChild = G.ele.lastChild
      const rectTop = firstChild.getBoundingClientRect()
      const rectBottom = lastChild.getBoundingClientRect()
      let curFirstChild = null
      let curLastChild = null
      if (curFirstChild !== firstChild && rectTop.bottom > rect.top) {
        topDom(() => (curFirstChild = firstChild))
      }
      if (curLastChild !== lastChild && rectBottom.top < rect.bottom) {
        bottomDom(() => (curLastChild = lastChild))
      }
    }, 60))
  } else {
    const observe = (observer, ele) => {
      if (observer.ele !== ele) {
        const rect = ele.getBoundingClientRect()
        if (observer.bottom !== rect.bottom) {
          observer.disconnect()
          observer.observe(ele)
          observer.ele = ele
          observer.bottom = rect.bottom
        }
      }
    }
    const topObserver = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        topDom(() => {
          observe(topObserver, G.ele.firstChild)
          observe(bottomObserver, G.ele.lastChild)
        })
      }
    }, { root: G.ele, threshold: 0 })
    const bottomObserver = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        bottomDom(() => {
          observe(topObserver, G.ele.firstChild)
          observe(bottomObserver, G.ele.lastChild)
        })
      }
    }, { root: G.ele, threshold: 0 })
    observe(bottomObserver, G.ele.lastChild)
  }
}
/** 刷新 */
const refresh = (data) => {
  G.startIndex = 0
  Dom.clear()
  Dom.append(data)
  scrollListener()
}
/** requestAnimationFrame兼容 */
const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (f) {
  window.setTimeout(f, 1000 / 60)
}

/** 下拉刷新 */
function pullDownListener () {
  const getY = e => e.targetTouches ? e.targetTouches[0].clientY : e.clientY
  let started = false
  const start = e => {
    if (G.ele.scrollTop) { return }
    startY = getY(e); ['mousemove', 'touchmove'].forEach(v => G.ele.addEventListener(v, move)); ['mouseup', 'touchend'].forEach(v => document.addEventListener(v, end))
  }
  const move = e => {
    const paddingTop = getY(e) - startY
    if (paddingTop > 0) {
      if (started === false) {
        G.onPullDownStart({ startY })
        started = true
      }
      if (G.onPullDownMove({ paddingTop }) === undefined) { Dom.paddingTop(paddingTop) }
    }
  }
  const end = () => {
    ;['mousemove', 'touchmove'].forEach(v => G.ele.removeEventListener(v, move)); ['mouseup', 'touchend'].forEach(v => G.ele.removeEventListener(v, end))
    let paddingTop = Dom.paddingTop()
    G.onPullDownEnd({ paddingTop, cb (data) { refresh(data) } })
    const f = () => {
      const t = Math.max(5, paddingTop / 10)
      if (paddingTop > t) {
        Dom.paddingTop(paddingTop -= t)
        requestAnimationFrame(f)
      } else {
        Dom.paddingTop(0)
        started = false
      }
    }
    requestAnimationFrame(f)
  }; let startY = 0; ['mousedown', 'touchstart'].forEach(v => G.ele.addEventListener(v, start))
}
export default init
