# mtfScrollList
MTF滚动列表插件，支持虚拟无限滚动，上拉刷新，下拉刷新
## 无限滚动
![无限滚动.gif](https://i.loli.net/2021/01/24/ju5CpZwvtUVkHR1.gif)
### 特点
1. 移动端 + PC，兼容IE10+
2. 虚拟化，只渲染可视区域 + 根据滚动方向预先渲染
3. 列表每一项**高度任意**，内容自适应
4. 双向快速滚动，几乎无闪屏，平滑无感
5. 双向缓存队列 + 文档碎片，复用多，渲染少，速度快
6. 双向加载更多，上拉 或 下拉到底，读取新数据
## 下拉刷新
![下拉刷新.gif](https://i.loli.net/2021/01/24/pfYku1XM25IUcDG.gif)
### 特点
1. 移动端 + PC，兼容IE10+
2. 开箱即用，默认复用 无限滚动 加载数据逻辑

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
mtfScrollList.init({
  ele: document.getElementById('scrolllist'),
  perPage: 6,
  data: [],
  render ({ data, index }) {
    const d = document.createElement('div')
    d.setAttribute('index', index)
    d.id = 'id' + index
    d.innerHTML = data
    return d
  },
  onTop ({ cb }) {
    setTimeout(() => {
      cb(data)
    }, 0)
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
  data={this.state.data || []}
  perPage={6}
  render={({data, index}) => <div key={index}/>{data}</div>}/> // 渲染列表每一项，支持传入React组件
  onTop={cb => {}}
  onBottom={cb => {}} 
  onPullDownStart={startY => {}} 
  onPullDownMove={paddingTop => {}} 
  onPullDownEnd={(paddingTop, cb) => {}}
></ReactMtfScrollList>
```