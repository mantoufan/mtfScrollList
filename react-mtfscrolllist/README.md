# mtfScrollList
MTF滚动列表插件，支持虚拟化无限滚动，上拉到顶，下拉到底加载更多，下拉刷新。可在原生JS、React和Vue（未来）中使用。
## 无限滚动
![无限滚动.gif](https://i.loli.net/2021/01/24/ju5CpZwvtUVkHR1.gif)
### 特点
1. 移动端 + PC
2. 虚拟化，只渲染可视区域 + 根据滚动方向预先渲染
3. 列表每一项**高度任意**，内容自适应
4. 双向快速滚动，几乎无闪屏，平滑无感
5. 双向缓存栈 + 文档碎片，复用多，渲染少，速度快
6. 双向加载更多，上拉到顶 或 下拉到底，读取新数据
## 下拉刷新
![下拉刷新.gif](https://i.loli.net/2021/01/24/pfYku1XM25IUcDG.gif)
### 特点
1. 移动端 + PC
2. 根据下拉距离，决定是否继续下拉，是否加载数据

# 快速开始
本插件打包采用`umd`模块化规范
## 一 原生JS
### 1.1 安装
#### 1.1.1 NodeJS
安装
```shell
npm i mtfscrolllist -D
```
引入
```javascript
import MtfScrollList from 'mtfscrolllist'
const mtfScrollList = new MtfScrollList()
```
#### 1.1.2 浏览器
引入
```html
/** 引入 require.js */
<script src="https://cdn.bootcdn.net/ajax/libs/require.js/2.3.6/require.min.js"></script>
/** 加载 插件 */
<script>
require(['https://cdn.jsdelivr.net/npm/mtfscrolllist@1.0.3/dist/mtfscrolllist.min.js'], function (module) {
  const MtfScrollList = module.default
  const mtfScrollList = new MtfScrollList()
})
</script>
```
### 1.2 使用
```html
<style>
.scrolllist {
  height: 360px;
  overflow: auto;
}
</style>
<div id="scrolllist" class="scrolllist"></div>
<script>
const data = [{id:1, text:'a'}, {id:2, img:'2.jpg'}]
mtfScrollList.init({
  ele: document.getElementById('scrolllist'), // 容器
  data: data, // 初始数据，默认为空
  startIndex: 6, // 起始索引，默认是 初始数据的长度。如果容器初始HTML不为空，推荐指定起始索引
  perPage: 6, // 每页条数，默认是 5。如果容器初始HTML不为空，推荐指定每页条数
  render ({ data, index }) { // 渲染列表的每一项
    const d = document.createElement('div')
    d.setAttribute('index', index)
    d.id = 'id' + index
    d.innerHTML = data.text
    return d
  },
  onTop ({ cb, page }) { // 上拉到顶，加载更多：回调函数，当前页数
    setTimeout(() => {
      cb(data)
    }, 1500) // 模拟获取数据
  },
  onBottom ({ cb, page }) { // 下拉到底，加载更多：回调函数，当前页数
    setTimeout(() => {
      cb(data)
    }, 0)
  },
  onPullDownStart ({ startY }) {// 下拉刷新：刚开始下拉。可获得起始Y坐标
    let d = document.getElementById('tip')
    removeChild(d)
    d = document.createElement('div')
    d.className = 'tip'
    d.innerHTML = '下拉刷新'
    d.id = 'tip'
    document.body.appendChild(d)
  },
  onPullDownMove ({ paddingTop }) {// 下拉刷新：拖动下拉。可获得下拉距离
    const d = document.getElementById('tip')
    if (paddingTop < 50) d.innerHTML = '您已下拉' + paddingTop
    else if (paddingTop > 100) return true // 返回true，阻止继续下拉
    else d.innerHTML = '松开刷新'
    d.style.marginTop = (paddingTop >> 1) + 'px'
  },
  onPullDownEnd ({ paddingTop, cb }) {// 下拉刷新：结束下拉。可获得下拉距离，将数据传入回调函数
    const d = document.getElementById('tip')
    if (paddingTop >= 50) { // 到达指定下拉距离，开始获取数据
      d.innerHTML = '开始为您刷新'
      setTimeout(() => {
        removeChild(d)
        cb(data)
      }, 1500)
    } else { // 没有到到指定下拉距离，自动回弹
      removeChild(d)
    }
  }
})
</script>
```
## 二 React
### 安装
```shell
npm i mtfscrolllist -D
npm i react-mtfscrolllist -D
```
### 引入
```javascript
import ReactMtfScrollList from 'react-mtfscrolllist'
```
### 使用
```css
.scrolllist {
  height: 360px;
  overflow: auto;
}
```
```javascript
<ReactMtfScrollList 
  className="scrolllist"
  data={this.state.data || []} // 可绑定props或state
  perPage={6}
  render={({data, index}) => <div key={index}/>{data}</div>}/> // 渲染列表每一项，支持传入React组件
  onTop={cb => {}}
  onBottom={cb => {}} 
  onPullDownStart={startY => {}} 
  onPullDownMove={paddingTop => {}} 
  onPullDownEnd={(paddingTop, cb) => {}}
></ReactMtfScrollList>
```

# 示例
## 原生JS
- [演示DEMO](https://mantoufan.github.io/mtfScrollList/mtfscrolllist/demo/)
## React
- [口袋豆瓣](http://w.page.imweb.io/douban-pocket/book)