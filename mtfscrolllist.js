let G = Object.create(null)
const init = ({ele = null, data = [], tpl = v => v, startIndex = 0, perPage = data.length, onTop = v => v, onBottom = v => v}) => {
    G = { ele, tpl, startIndex, perPage, onTop, onBottom }
    Dom.append(data)
    scrollListener()
}
class cacheHeightStack {
    constructor () {
        this.stack = []
        this.height = 0
    }
    isEmpty() {
        return this.stack.length === 0
    }
    push ({ele, height}) {
        this.height += height || 0
        return this.stack.push({ele, height})
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
    cache: { top: new cacheHeightStack, bottom: new cacheHeightStack },
    height (ele) {
        const styles = ele.currentStyle || window.getComputedStyle(ele)
        return ele.offsetHeight + parseInt(styles['marginTop'] | 0) + parseInt(styles['marginBottom'] | 0)
    },
    prepend (data) {
        const firstChild = G.ele.firstChild 
        data.forEach(data => G.ele.insertBefore(G.tpl(data, G.startIndex++), firstChild))
    },
    prependFromCache () {
        const firstChild = G.ele.firstChild, prev = Dom.cache.top.pop()
        if (prev) prev.ele.forEach(ele => G.ele.insertBefore(ele, firstChild))
    },
    append (data) {
        data.forEach(data => G.ele.appendChild(G.tpl(data, G.startIndex++)))
    },
    appendFromCache () {
        const last = Dom.cache.bottom.pop()
        if (last) last.ele.forEach(ele => G.ele.appendChild(ele))
    },
    clearTop () {
        if (G.ele.children.length > G.perPage) {
            let i = -1, ele = Array(G.perPage), height = 0
            while (++i < G.perPage) {
                height += Dom.height(ele[i] = G.ele.children[0])
                G.ele.removeChild(ele[i])
            }
            Dom.cache.top.push({ele, height})
        }
    },
    clearBottom () {
        if (G.ele.children.length > G.perPage) {
            let i = G.perPage, ele = Array(G.perPage), height = 0
            while (i--) {
                height += Dom.height(ele[i] = G.ele.children[G.ele.children.length - 1])
                G.ele.removeChild(ele[i])
            }
            Dom.cache.bottom.push({ele, height})
        }
    }
}
/** 监听滚动事件 */
const scrollListener = () => {
    if (typeof IntersectionObserver === void 0) {

    } else {
        const reObserve = (observer, ele) => {
            observer.disconnect()
            observer.observe(ele)
        }
        const topObserver = new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                Dom.clearBottom()
                bottomObserver.disconnect()
                bottomObserver.observe(G.ele.lastChild)
                if (Dom.cache.top.isEmpty()) {
                    const data = G.onTop()
                    if (data) {
                        Dom.prepend(data)
                        reObserve(observer, G.ele.firstChild)
                    }
                } else {
                    Dom.prependFromCache()
                    reObserve(observer, G.ele.firstChild)
                }
                
            }
        }, { root: G.ele, threshold: 0 })
        const bottomObserver = new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                Dom.clearTop()
                topObserver.disconnect()
                topObserver.observe(G.ele.firstChild)
                if (Dom.cache.bottom.isEmpty()) {
                    const data = G.onBottom()
                    if (data) {
                        Dom.append(data)
                        reObserve(observer, G.ele.lastChild)
                    }
                } else {
                    Dom.appendFromCache()
                    reObserve(observer, G.ele.lastChild)
                }
            }
        }, { root: G.ele, threshold: 0 })
        bottomObserver.observe(G.ele.lastChild)
    }
}

export default init