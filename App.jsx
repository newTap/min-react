import React from './core/React.js'
import Todo from './src/index.jsx'
// import React from './code/React.js';

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


const  App = () => {
  
  return (
  <Todo/>
)}

console.log('App', App)
export default App