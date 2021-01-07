import data from './data.js'
import mtfScrollList from '../mtfscrolllist.js'
import './style.css'
mtfScrollList({
    ele: document.getElementById('scrolllist'),
    data,
    tpl (data, index) {
        const d = document.createElement('div')
        d.setAttribute('index', index)
        d.id = 'id' + index
        d.innerHTML = data
        return d
    },
    onBottom () {
        return data
    }
})
