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
/** requestAnimationFrame兼容 */
const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (f) {
  window.setTimeout(f, 1000 / 60)
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

  clear () {
    this.height = this.stack.length = 0
  }
}
class MtfScrollListDom {
  constructor ({ self }) {
    this.self = self
    this.firstChild = null
    this.lastChild = null
    this.cache = { top: new CacheHeightStack(), bottom: new CacheHeightStack() }
  }

  paddingTop (top) {
    if (top) this.self.G.ele.style.paddingTop = top + 'px'
    if (top === 0) return this.self.G.ele.style.removeProperty('padding-top')
    return top || parseInt(this.self.G.ele.style.paddingTop) || 0
  }

  firstChildPaddingTop (top) {
    this.firstChild.style.paddingTop = top + 'px'
  }

  lastChildPaddingBottom (bottom) {
    this.lastChild.style.paddingBottom = bottom + 'px'
  }

  height (ele) {
    const styles = ele.currentStyle || window.getComputedStyle(ele)
    return ele.offsetHeight + parseInt(styles.marginTop | 0) + parseInt(styles.marginBottom | 0)
  }

  prepend (data) {
    const firstChild = this.firstChild.nextSibling
    const fragment = document.createDocumentFragment()
    data.forEach(data => fragment.appendChild(this.self.G.render({ data, index: this.self.G.startIndex++ })))
    this.self.G.ele.insertBefore(fragment, firstChild)
  }

  prependFromCache () {
    const prev = this.cache.top.pop()
    if (prev) {
      const firstChild = this.firstChild.nextSibling
      const fragment = document.createDocumentFragment()
      prev.ele.forEach(ele => fragment.appendChild(ele))
      this.self.G.ele.insertBefore(fragment, firstChild)
      this.firstChildPaddingTop(this.cache.top.height)
    }
  }

  append (data) {
    const fragment = document.createDocumentFragment()
    data.forEach(data => fragment.appendChild(this.self.G.render({ data, index: this.self.G.startIndex++ })))
    this.self.G.ele.insertBefore(fragment, this.lastChild)
  }

  appendFromCache () {
    const last = this.cache.bottom.pop()
    if (last) {
      const fragment = document.createDocumentFragment()
      last.ele.forEach(ele => fragment.appendChild(ele))
      this.self.G.ele.insertBefore(fragment, this.lastChild)
      this.lastChildPaddingBottom(this.cache.bottom.height)
    }
  }

  clearTop () {
    if (this.self.G.ele.children.length - 2 > this.self.G.perPage) {
      const ele = Array(this.self.G.perPage)
      let i = -1
      let height = 0
      while (++i < this.self.G.perPage) {
        height += this.height(ele[i] = this.self.G.ele.children[1])
        this.self.G.ele.removeChild(ele[i])
      }
      this.cache.top.push({ ele, height })
      this.firstChildPaddingTop(this.cache.top.height)
    }
  }

  clearBottom () {
    let i = this.self.G.ele.children.length - 2 - this.self.G.perPage
    if (i > 0) {
      const ele = Array(i)
      let height = 0
      while (i--) {
        height += this.height(ele[i] = this.self.G.ele.children[this.self.G.ele.children.length - 2])
        this.self.G.ele.removeChild(ele[i])
      }
      this.cache.bottom.push({ ele, height })
      this.lastChildPaddingBottom(this.cache.bottom.height)
    }
  }

  init () {
    this.firstChild = document.createElement('div')
    this.lastChild = document.createElement('div')
    this.firstChild.style.height = this.lastChild.style.height = '1px'
    this.self.G.ele.appendChild(this.lastChild)
    this.self.G.ele.insertBefore(this.firstChild, this.self.G.ele.firstChild)
  }

  clear () {
    let i = this.self.G.ele.children.length - 1
    while (i-- > 1) this.self.G.ele.removeChild(this.self.G.ele.children[this.self.G.ele.children.length - 2])
    this.firstChildPaddingTop(0)
    this.lastChildPaddingBottom(0)
    this.cache.top.clear()
    this.cache.bottom.clear()
  }
}
module.exports = class MtfScrollList {
  constructor () {
    this.G = Object.create(null)
    this.Dom = new MtfScrollListDom({ self: this })
  }

  init ({ ele = null, data = [], render = () => document.createElement('div'), startIndex = data.length, perPage = 5, onTop = () => {}, onBottom = () => {}, onPullDownStart = () => {}, onPullDownMove = () => {}, onPullDownEnd = () => {} }) {
    this.G = { ele, render, startIndex, perPage, onTop, onBottom, onPullDownStart, onPullDownMove, onPullDownEnd }
    this.Dom.init()
    if (data.length) this.refresh({ data })
    this.scrollListener()
    this.pullDownListener()
  }

  /** 监听滚动事件 */
  scrollListener () {
    const topDom = () => {
      const self = this
      if (this.Dom.cache.top.isEmpty()) {
        if (this.G.startIndex % this.G.perPage > 0) return
        this.G.onTop({
          cb (data) {
            if (data) {
              self.Dom.clearBottom()
              self.Dom.prepend(data)
            }
          },
          page: this.G.startIndex / this.G.perPage + 1
        })
      } else {
        this.Dom.clearBottom()
        this.Dom.prependFromCache()
      }
    }
    const bottomDom = () => {
      const self = this
      if (this.Dom.cache.bottom.isEmpty()) {
        if (this.G.startIndex % this.G.perPage > 0) return
        this.G.onBottom({
          cb (data) {
            if (data) {
              self.Dom.clearTop()
              self.Dom.append(data)
            }
          },
          page: this.G.startIndex / this.G.perPage + 1
        })
      } else {
        this.Dom.clearTop()
        this.Dom.appendFromCache()
      }
    }
    /** 校正 */
    const scroll = () => {
      const rect = this.G.ele.getBoundingClientRect()
      const rectTop = this.Dom.firstChild.getBoundingClientRect()
      const rectBottom = this.Dom.lastChild.getBoundingClientRect()
      if (rectTop.bottom > rect.top) topDom()
      if (rectBottom.top < rect.bottom) bottomDom()
    }
    const correct = retryTime => {
      if (retryTime > 2) return
      const firstHeight = this.Dom.firstChild.offsetHeight
      const lastHeight = this.Dom.lastChild.offsetTop + 1
      if ((firstHeight > 1 && this.G.ele.scrollTop < firstHeight) || (lastHeight > 1 && lastHeight > this.G.ele.offsetHeight && this.G.ele.scrollTop + this.G.ele.offsetHeight > lastHeight)) {
        scroll()
        correct((retryTime || 0) + 1)
      }
    }
    if (typeof IntersectionObserver === 'undefined') {
      this.G.ele.addEventListener('scroll', throttle(scroll, 1000 / 60))
    } else {
      const observer = new window.IntersectionObserver(entries => {
        if (entries.length === 1 && entries[0].isIntersecting) entries[0].target === this.Dom.firstChild ? topDom() : bottomDom()
      }, { root: this.G.ele, threshold: 0 })
      observer.observe(this.Dom.firstChild)
      observer.observe(this.Dom.lastChild)
    }
    this.G.ele.addEventListener('scroll', throttle(correct, 150, true))
  }

  /** 刷新 */
  refresh ({ data, perPage }) {
    this.G.startIndex = 0
    this.Dom.clear()
    if (perPage) this.G.perPage = perPage
    if (data) this.Dom.append(data)
  }

  /** 下拉刷新 */
  pullDownListener () {
    const getY = e => e.targetTouches ? e.targetTouches[0].clientY : e.clientY
    const isSupportTouch = 'ontouchend' in document
    let started = false
    let startY = 0
    const start = e => {
      if (this.G.ele.scrollTop) { return }
      startY = getY(e)
      this.G.ele.addEventListener(isSupportTouch ? 'touchmove' : 'mousemove', move)
      document.addEventListener(isSupportTouch ? 'touchend' : 'mouseup', end)
    }
    const move = e => {
      const paddingTop = getY(e) - startY
      if (paddingTop > 0) {
        if (started === false) {
          this.G.onPullDownStart({ startY })
          started = true
        }
        if (this.G.onPullDownMove({ paddingTop }) === undefined) { this.Dom.paddingTop(paddingTop) }
      }
    }
    const end = () => {
      const self = this
      this.G.ele.removeEventListener(isSupportTouch ? 'touchmove' : 'mousemove', move)
      document.removeEventListener(isSupportTouch ? 'touchend' : 'mouseup', end)
      let paddingTop = this.Dom.paddingTop()
      this.G.onPullDownEnd({ paddingTop, cb (data) { self.refresh({ data }) } })
      const f = () => {
        const t = Math.max(5, paddingTop / 10)
        if (paddingTop > t) {
          this.Dom.paddingTop(paddingTop -= t)
          requestAnimationFrame(f)
        } else {
          this.Dom.paddingTop(0)
          started = false
        }
      }
      requestAnimationFrame(f)
    }
    this.G.ele.addEventListener(isSupportTouch ? 'touchstart' : 'mousedown', start)
  }
}
