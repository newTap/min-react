import { forEach } from "lodash";
import { styleOperate } from "./DomOperate";

const TEXT_NODE_TYPE = 'TEXT_ELEMENT'

function createTextNode(node) {
  return {
    type: TEXT_NODE_TYPE,
    props: {
      // textElement类型可以使用set attribute 方法,设置nodeValue属性来设置文本
      nodeValue: node
    },
    children: []
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
  const vnode = createVnode(type, props, ...children)
  return vnode
}

// render根据vnode来渲染dom元素
function render(node, container){
  let vnode = typeof node === 'function' ? node() : node
  nextWorkOfUnit = {
    dom:container,
    children: [vnode]
  }
}

let nextWorkOfUnit = null;
function workLoop(deadline) {
  let shouldYield = false;
  //  有需要执行fiber并且时间充裕
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    shouldYield = deadline.timeRemaining() < 5;
  }

  requestIdleCallback(workLoop);
}

// 处理vnode转化为fiber
// 创建filer间的引用
// 根据fiber对象来渲染dom
// 返回下一个fiber对象
function performWorkOfUnit(worker){
  let {dom, children} = worker
  // 首次初始化的时候,会默认自带dom,但是后续的fiber是需要创建的
  if(!dom) {
    // 创建对应fiber dom的同时将其添加至fiber中
      dom  = worker.dom = performCreatedDom(worker.type, worker.props, worker.children)
      worker.parent.dom.appendChild(dom)
  }

  let prevFiber
  // 生成fiber数据结构
  children?.forEach((item, index) => {
    const {type, props} = item
    const fiber = createdFiberInfo({type, props, parent:worker})
    // !此处children不能少,因为fiber需要vnode中的children来查找对应的关系链接
    fiber.children = item.children
    if(index === 0){
      // 默认第一个节点为子节点
      worker.child = fiber
    }else{
      // 通过记录prevFiber来设置对应的sibling节点
      prevFiber.sibling= fiber
    }
    prevFiber = fiber
  })

  // 根据fiber返回的顺序,优先返回child,然后是sibling最后是parent的sibling
  if(worker.child)return worker.child
  if(worker.sibling)return worker.sibling
  return worker?.parent?.sibling
}

function performCreatedDom(type, props){
  let dom;

  if(type === TEXT_NODE_TYPE){
    dom = document.createTextNode(props.nodeValue)
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
  return dom
}

function createdFiberInfo({type,dom, props, child, sibling, parent}){
  return {
    type: type,
    props: props,
    dom: dom,
    child: child,
    sibling: sibling,
    parent: parent,
  }
}

requestIdleCallback(workLoop);

const React = {
  render,
  createElement
}

export default React