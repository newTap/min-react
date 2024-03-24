import React from './core/React.js'

// !在jsx中会默认调用React中的createElement函数来初始化一个虚拟dom
// function TestCom () {
//   return <div>hello word</div>
// }
// 经过处理后返回如下函数
// TestCom() {
//   return /* @__PURE__ */ React.createElement("div", null, "hello word");
// }

const App = <div id="hello">hello word</div>

export default App