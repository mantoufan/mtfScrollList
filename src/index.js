import data from './data.js'
import './style.css'
const scrollList = document.getElementById('scrolllist')
data.forEach(v => scrollList.innerHTML += v)
