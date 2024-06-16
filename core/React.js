import { styleOperate } from "./DomOperate";

const TEXT_NODE_TYPE = 'TEXT_ELEMENT'

function createTextNode(node) {
  return {
    type: TEXT_NODE_TYPE,
    props: { },
    nodeValue: document.createTextNode(node)
  }
}

function createVnode(type, props, ...children){
  return{
    type,
    props,
    children: children.map(child => typeof child === 'string' ? createTextNode(child) : child)
  }
}

// !在jsx中，会默认调用React中的createElement函数来初始化一个虚拟dom
function createElement(type, props, ...children){
  console.log(type, props, children)
  const vnode = createVnode(type, props, ...children)
  console.log('vnode', vnode)
  return vnode
  
}

// render根据vnode来渲染dom元素
function render(node, container){
  let vnode = typeof node === 'function' ? node() : node
  console.log('nodexxxx', node)
  // 当组件是函数组件时，需要执行对应的函数组件
  const {type, props, children} = vnode;
  let dom;
  
  console.log('vdomvdom', vnode)
  if(type === TEXT_NODE_TYPE){
    dom = vnode.nodeValue
  }else{
    dom = document.createElement(type)
    for (let key in props){
      if(key === 'style'){
        styleOperate(dom, props[key])
      }else{
        dom.setAttribute(key, props[key])
      }
    }
  }
  
  children?.forEach(item => {
    render(item, dom)
  })

  container.appendChild(dom)
}



const React = {
  render,
  createElement
}

export default React