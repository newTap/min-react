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

let status = true;

const List = ({id}) => {
  const [num, setNum] = React.useState(10)
  const [name, setName] = React.useState('小明')
  React.useEffect(() =>{
    console.log('init')
  },[])
  React.useEffect(() =>{
    console.log('change', name)
    return () => {
      console.log('取消依赖', name)
    }
  },[name])
  React.useEffect(() =>{
    console.log('change, name', num)
    return () => {
      console.log('effect name', num)
    }
  },[num])
  function click(){
    console.log('12313')
    number+=1;
    // setNum((number) => number+=1)
    setNum((number) => number+=1)
    // setNum(10)
    setName((name) => name+'-')
    console.log('number', number)
  }
  console.log('2222222')
  return (
  <div>
    <li onClick={click} id={id} >1:{num}:{name}</li>
    <li>2</li>
    <li>3</li>
  </div>
)
}

let number = 0;
let props = {
  id:'hel'
}

const Hello = () => {
  const effect = React.update()
  console.log('123')
  function click(){
    props.id = '123'
    status = !status;
    effect()
  }
  return (<div>
    <div onClick={click}>hello</div>
    {status ? 
      <List id={props.id}/>
    : <div>123</div>}
  </div>)
}

const  App = () => {
  
  return (
  <div id="hello">
    {/* <div>hello</div> */}
    <Hello/>
    {/* <Hello num={300}/>
    <Hello num={600}/> */}
    <span style={{marginLeft: '10px'}}>word</span>
  </div>
)}

// const App = <div>123</div>
console.log('App', App)
export default App