import data from './data.js'
import mtfScrollList from '../mtfscrolllist.js'
import './style.css'

mtfScrollList({
    ele: document.getElementById('scrolllist'),
    data,
    render (data, index) {
        const d = document.createElement('div')
        d.setAttribute('index', index)
        d.id = 'id' + index
        d.innerHTML = data
        return d
    },
    onBottom () {
        return data
    },
    onPullDownStart ({ startY }) {
        const d = document.createElement('div')
        d.className = 'tip'
        d.innerHTML = '下拉刷新'
        d.id = 'tip'
        document.body.appendChild(d)
    },
    onPullDownMove ({ paddingTop }) {
        let d = document.getElementById('tip')
        if (paddingTop < 80) 
            d.innerHTML = '您已下拉' + paddingTop
        else if (paddingTop > 100) 
            return true // 禁止继续下拉
        else 
            d.innerHTML = '松开刷新'
    },
    onPullDownEnd ({ paddingTop }) {
        let d = document.getElementById('tip')
        d.innerHTML = '开始为您刷新'
        setTimeout(() => d.parentNode.removeChild(d), 1500)
        if (paddingTop >= 80) return data
    }
})
