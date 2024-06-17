import React from './core/React.js'

// !在jsx中会默认调用React中的createElement函数来初始化一个虚拟dom
// function TestCom () {
//   return <div>hello word</div>
// }
// 经过处理后返回如下函数
// TestCom() {
//   return /* @__PURE__ */ React.createElement("div", null, "hello word");
// }

// const App = (
//   <div id="hello">
//     <span>hello</span>
//     <span>word</span>
//   </div>
// )

const List = () => (
  <div>
    <li>1</li>
    <li>2</li>
    <li>3</li>
  </div>
)

const Hello = ({num}) => (
  <div>
    <div>hello:{num}</div>
    <List/>
  </div>
)

const  App = () => (
  <div id="hello">
    {/* <div>hello</div> */}
    <Hello num={20}/>
    <Hello num={300}/>
    <Hello num={600}/>
    <span style={{marginLeft: '10px'}}>word</span>
  </div>
)

// const App = <div>123</div>
console.log('App', App)
export default App