import { styleOperate } from "./DomOperate";
import { isFunction } from "../util";

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
    children: children.map(child => typeof child === 'object' ? child : createTextNode(child))
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
  root = nextWorkOfUnit
}

let nextWorkOfUnit = null;
// 用于记录根组建,当根组建全部更新好之后,再渲染至页面上
let root = null
function workLoop(deadline) {
  let shouldYield = false;
  //  有需要执行fiber并且时间充裕
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    // 首次渲染将完成之后将root清空
    if(!nextWorkOfUnit && root){
      commitRoot(root.child);
      root = null;
    }
    shouldYield = deadline.timeRemaining() < 5;
  }

  requestIdleCallback(workLoop);
}

// 当根组建全部更新好之后，再渲染至页面上,防止一次性渲染不全的问题
function commitRoot(fiber){
  if(!root) return false;
  
  let parentFiber = fiber?.parent
  let parentFiberDom = fiber?.parent?.dom

  // 当组建嵌套之后,会遇到parent的dom为空的情况,需要不断往上级查找直到能找到真实dom
  while(!parentFiberDom){
    parentFiber = parentFiber?.parent
    parentFiberDom = parentFiber?.dom
  }
  if(fiber?.dom){
    parentFiberDom.appendChild(fiber?.dom)
  }

  if(fiber?.child){
    commitRoot(fiber.child)
  }
  if(fiber?.sibling){
    commitRoot(fiber.sibling)
  }
}

// 处理vnode转化为fiber
// 创建filer间的引用
// 根据fiber对象来渲染dom
// 返回下一个fiber对象
function performWorkOfUnit(worker){
  let {dom, children} = worker
  const isFunctionComponent  = isFunction(worker.type)
  // 首次初始化的时候,会默认自带dom,但是后续的fiber是需要创建的
  if(!dom && !isFunctionComponent) {
    // 创建对应fiber dom的同时将其添加至fiber中
      dom = worker.dom = performCreatedDom(worker.type, worker.props, worker.children)
      // worker.parent.dom.appendChild(dom)
  }
  // 当遇到函数组建时，需要将其转化为虚拟dom
  if( isFunctionComponent ){
    children = worker.children = [worker.type(worker.props)]
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
  // 当在组建嵌套时,单独寻找上一层的父元素的sibling,可能会遇空,所以需要一直往上一级寻找
  let parent = worker?.parent
  while(parent&&!parent?.sibling){
   parent = parent?.parent
  }
  return parent?.sibling
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