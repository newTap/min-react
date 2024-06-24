import React from './core/React.js'
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

const List = ({id}) => {
  function click(){
    console.log('12313')
    number+=1;
    React.effect()
    console.log('number', number)
  }
  console.log('2222222')
  return (
  <div>
    <li onClick={click} id={id} >1:{number}</li>
    <li>2</li>
    <li>3</li>
  </div>
)
}

let number = 0;
let props = {
  id:'hel'
}

const Hello = ({num}) => {
  console.log('重新执行了')
  function click(){
    console.log('123')
    props.id = '123'
    React.effect()
  }
  return (<div>
    <div onClick={click}>hello:{num}</div>
    <List id={props.id}/>
  </div>)
}

const  App = () => {
  
  return (
  <div id="hello">
    {/* <div>hello</div> */}
    <Hello num={number}/>
    {/* <Hello num={300}/>
    <Hello num={600}/> */}
    <span style={{marginLeft: '10px'}}>word</span>
  </div>
)}

// const App = <div>123</div>
console.log('App', App)
export default App