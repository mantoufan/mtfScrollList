let G = Object.create(null)
const init = ({ele = null, data = [], tpl = v => v, startIndex = 0, perPage = data.length, onTop = v => v, onBottom = v => v}) => {
    G = { ele, tpl, startIndex, perPage, onTop, onBottom }
    Dom.append(data)
    scrollListener()
}
const Dom = {
    cache: [[], []],
    prepend (data) {
        const firstChild = G.ele.firstChild
        data.forEach(data => G.ele.insertBefore(G.tpl(data, G.startIndex++), firstChild))
    },
    prependFromCache () {
        const firstChild = G.ele.firstChild, prev = Dom.cache[0].pop()
        if (prev) prev.forEach(n => G.ele.insertBefore(n, firstChild))
    },
    append (data) {
        data.forEach(data => G.ele.appendChild(G.tpl(data, G.startIndex++)))
    },
    appendFromCache () {
        const last = Dom.cache[1].pop()
        if (last) last.forEach(n => G.ele.appendChild(n))
    },
    clearTop () {
        if (G.ele.children.length > G.perPage) {
            let i = -1, t = Array(G.perPage)
            while (++i < G.perPage) G.ele.removeChild(t[i] = G.ele.children[0])
            Dom.cache[0].push(t)
        }
    },
    clearBottom () {
        if (G.ele.children.length > G.perPage) {
            let i = G.perPage, t = Array(G.perPage)
            while (i--) G.ele.removeChild(t[i] = G.ele.children[G.ele.children.length - 1])
            Dom.cache[1].push(t)
        }
    }
}
/** 监听滚动事件 */
const scrollListener = () => {
    if (typeof IntersectionObserver === void 0) {

    } else {
        const topObserver = new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                Dom.clearBottom()
                bottomObserver.disconnect()
                bottomObserver.observe(G.ele.lastChild)

                if (Dom.cache[1].length === 0) {
                    const data = G.onTop()
                    if (data) Dom.prepend(data)
                } else {
                    Dom.prependFromCache()
                }
                observer.disconnect()
                observer.observe(G.ele.firstChild)
            }
        }, { root: G.ele, threshold: 0 })
        const bottomObserver = new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                Dom.clearTop()
                topObserver.disconnect()
                topObserver.observe(G.ele.firstChild)

                if (Dom.cache[1].length === 0) {
                    const data = G.onBottom()
                    if (data) Dom.append(data)
                } else {
                    Dom.appendFromCache()
                }
                observer.disconnect()
                observer.observe(G.ele.lastChild)
            }
        }, { root: G.ele, threshold: 0 })
        bottomObserver.observe(G.ele.lastChild)
    }
}

export default init