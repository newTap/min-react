import { styleOperate } from "./DomOperate";

function createVnode(type, props, ...children){
  return{
    type,
    props,
    children: children,
  }

}

// !在jsx中，会默认调用React中的createElement函数来初始化一个虚拟dom
function createElement(type, props, ...children){
  console.log(type, props, children)
  const vnode = createVnode(type, props, ...children)
  console.log('vnode', vnode)
  
  // const {type, props, child} = vnode
  let dom = document.createElement(type);
  for (let key in props){
    if(key === 'style'){
      styleOperate(dom, props[key])
    }else{
      dom.setAttribute(key, props[key])
    }
  }
  children.forEach(item => {
    let child = item
    if(typeof item === 'string'){
      child = document.createTextNode(item)
    }
    return dom.appendChild(child);
  })
  return dom
}


function render(node, container){
  console.log(node)
  // 当组件是函数组件时，需要执行对应的函数组件
  let dom = typeof node === 'function' ? node() : node
  // 将基础使用类型直接转换成文本类型
  if(typeof dom != 'object'&&typeof dom != 'function'){
    dom = document.createTextNode(dom)
  }

  container.appendChild(dom)
}


const React = {
  render,
  createElement
}

export default React