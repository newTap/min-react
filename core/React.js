import { styleOperate } from "./DomOperate";
import { isFunction } from "../util";

const TEXT_NODE_TYPE = 'TEXT_ELEMENT'
const FIBER_UPDATE = 'update'
const PLACEMENT_UPDATE = 'placement'

function createTextNode(node) {
  return {
    type: TEXT_NODE_TYPE,
    props: {
      // 防止node为false的渲染
      nodeValue: node === false ? '' : node
    },
    children: []
  }
}

function createVnode(type, props, ...children) {
  return {
    type,
    props,
    children: children.map(child => typeof child === 'object' ? child : createTextNode(child))
  }
}

// !在jsx中，会默认调用React中的createElement函数来初始化一个虚拟dom
function createElement(type, props, ...children) {
  const vnode = createVnode(type, props, ...children)
  return vnode
}

// render根据vnode来渲染dom元素
function render(node, container) {
  let vnode = typeof node === 'function' ? node() : node
  nextWorkOfUnit = {
    dom: container,
    children: [vnode]
  }
  root = nextWorkOfUnit
}

// 搜集需要删除的fiber
let deletions = [];
let nextWorkOfUnit = null;
// 用于记录当前正在执行的根组件,当根组件全部更新好之后,再渲染至页面上
let root = null
let currentFiber = null
// 存储当前执行的函数组建
let saveFunctionComponent = null

function workLoop(deadline) {
  let shouldYield = false;
  //  有需要执行fiber并且时间充裕
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    // 首次渲染将完成之后将root清空
    if (!nextWorkOfUnit && root) {
      commitRoot(root.child);
      // effect在dom更新之后执行,所以必须在commitRoot完成之后调用
      commitEffects(root)
      while (deletions.length > 0) {
        let fiber = deletions.shift()
        commitDelete(fiber);
      }


      currentFiber = root
      root = null;
    }
    shouldYield = deadline.timeRemaining() < 5;
  }

  requestIdleCallback(workLoop);
}

function commitEffects(fiber) {
  if (!fiber) return false
  // 要区分第一次加载还是,后续的更新
  if (!fiber?.alternate || fiber.effectTag === PLACEMENT_UPDATE) {
    // 初始化
    initEffect(fiber)
  } else {
    // 后续更新
    updateEffect(fiber)
  }
}

function updateEffect(fiber) {
  let effectHooks = fiber.effectHooks
  let oldFiberHooks = fiber.alternate?.effectHooks
  effectHooks?.forEach(({ fun, deps }, index) => {
    // 若是函数组建跟新,effect没有传递依赖不执行
    if (!deps.length) return false
    let oldFiberDeps = oldFiberHooks?.[index]?.deps
    // 校验依赖是否有更新
    const isUpdate = deps.some((dep, i) => dep !== oldFiberDeps?.[i])
    if (isUpdate) {
      fun()
    }
  })
  // 无限递归下去,执行每一个fiber
  commitEffects(fiber.child)
  commitEffects(fiber.sibling)
}

function initEffect(fiber) {
  // initEffect,函数初始化,无论是否含有依赖,都应该执行
  let effectHooks = fiber.effectHooks
  effectHooks?.map((effect) => effect.fun())
  // 无限递归下去,执行每一个fiber
  commitEffects(fiber.child)
  commitEffects(fiber.sibling)
}

// 当根组件全部更新好之后，再渲染至页面上,防止一次性渲染不全的问题
function commitRoot(fiber) {
  if (!root) return false;

  let parentFiber = fiber?.parent
  let parentFiberDom = fiber?.parent?.dom

  // 当组建嵌套之后,会遇到parent的dom为空的情况,需要不断往上级查找直到能找到真实dom
  while (!parentFiberDom) {
    parentFiber = parentFiber?.parent
    parentFiberDom = parentFiber?.dom
  }

  if (fiber?.effectTag === FIBER_UPDATE && fiber.dom) {
    // fiber更新
    // 将fiber的dom更新到真实dom上
    const oldProps = fiber.alternate.props || {}
    const newProps = fiber.props || {}
    updateAttribute(fiber.dom, newProps, oldProps)
  }

  if (fiber?.dom && fiber.effectTag === PLACEMENT_UPDATE) {
    parentFiberDom.appendChild(fiber?.dom)
  }

  if (fiber?.child) {
    commitRoot(fiber.child)
  }
  if (fiber?.sibling) {
    commitRoot(fiber.sibling)
  }
}

function commitDelete(fiber) {
  let fiberParent = fiber.parent;
  let fiberDom = fiber
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }
  while (!fiberDom.dom) {
    fiberDom = fiberDom.child
  }
  // 校验,是否为子元素,即父元素可能已经被删除
  if (fiberParent.dom.contains(fiberDom.dom)) {
    fiberParent.dom.removeChild(fiberDom.dom)
  }
}

function functionComponent(fiber) {
  // 当遇到函数组建时，需要将其转化为虚拟dom
  //! 当函数组建更新之后,重新运行函数组建,即可获得最新的状态
  // 当函数组建执行的时候,暂时将该组建的fiber存储
  saveFunctionComponent = fiber
  // 每次开始处理下一个组建,将state的指正归零
  stateIndex = 0
  // 清除上个函数的effect列表
  effects = []
  fiber.children = [fiber.type(fiber.props)]
}

function hookComponent(fiber) {
  let { dom } = fiber
  // 首次初始化的时候,会默认自带dom,但是后续的fiber是需要创建的
  if (!dom || fiber.effectTag === PLACEMENT_UPDATE) {
    // 创建对应fiber dom的同时将其添加至fiber中
    dom = fiber.dom = performCreatedDom(fiber.type, fiber.props, fiber.children)
  }
}

// 处理vnode转化为fiber
// 创建filer间的引用
// 根据fiber对象来渲染dom
// 返回下一个fiber对象
function performWorkOfUnit(fiber) {
  const isFunctionComponent = isFunction(fiber.type)
  if (isFunctionComponent) {
    functionComponent(fiber)
  } else {
    hookComponent(fiber)
  }

  reconcileChildren(fiber, fiber.children)

  // 根据fiber返回的顺序,优先返回child,然后是sibling最后是parent的sibling
  if (fiber.child) return fiber.child
  if (fiber.sibling) return fiber.sibling
  // 当在组建嵌套时,单独寻找上一层的父元素的sibling,可能会遇空,所以需要一直往上一级寻找
  let parent = fiber?.parent
  while (parent && !parent?.sibling) {
    parent = parent?.parent
  }
  return parent?.sibling
}

function reconcileChildren(worker, children) {
  let oldFiber = worker?.alternate?.child
  // 记录上一个子fiber节点
  let prevFiber
  // 生成fiber数据结构
  children?.forEach((item, index) => {
    const type = item?.type;
    const props = item?.props
    const isSameType = oldFiber?.type === item?.type
    let fiber

    if (!(!isSameType && !item)) {
      fiber = createdFiberInfo({ type, dom: isSameType ? oldFiber?.dom : item.dom, children: item.children, props, parent: worker, oldFiber, effectTag: +isSameType })
    }
    // 类型不一样,并且有旧fiber,需要将dom去除
    if (!isSameType && oldFiber) {
      deletions.push(oldFiber);
    }

    // 将当前旧fiber更新到下一个旧的兄弟fiber
    if (oldFiber) {
      oldFiber = oldFiber?.sibling
    }

    if (index === 0) {
      // 默认第一个节点为子节点
      worker.child = fiber
    } else {
      // 通过记录prevFiber来设置对应的sibling节点
      prevFiber.sibling = fiber
    }
    prevFiber = fiber
  })
  // 是否含有多余的旧兄弟fiber,并将其dom删除
  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function performCreatedDom(type, props) {
  let dom;

  if (type === TEXT_NODE_TYPE) {
    dom = document.createTextNode(props.nodeValue)
  } else {
    dom = document.createElement(type)
    updateAttribute(dom, props)

  }
  return dom
}

function updateAttribute(dom, newProps, oldProps) {

  if (dom.nodeType === 3) {
    dom.nodeValue = newProps.nodeValue || ''
    return
  }

  const oldPropKeys = Object.keys(oldProps || {})
  if (oldPropKeys.length > 0) {
    oldPropKeys.forEach((key) => {
      if (!(key in newProps)) {
        dom.removeAttribute(key)
      }
    })
  }

  for (let key in newProps) {
    if (key === 'style') {
      styleOperate(dom, newProps[key])
    } else if (key.startsWith('on')) {
      // 事件监听
      const eventName = key.slice(2).toLowerCase()
      // 防止一个事件绑定多次，先将旧事件移除,再绑定新事件
      dom.removeEventListener(eventName, oldProps?.[key])
      dom.addEventListener(eventName, newProps[key])
    } else {
      dom.setAttribute(key, newProps[key])
    }
  }
}

// 创建fiber基础数据结构
function createdFiberInfo({ type, dom, props, children, child, sibling, parent, oldFiber, effectTag }) {
  const typeMap = [PLACEMENT_UPDATE, FIBER_UPDATE]
  return {
    type: type,
    props: props,
    dom: dom,
    child: child,
    sibling: sibling,
    // !此处children不能少,因为fiber需要vnode中的children来查找对应的关系链接
    children: children,
    parent: parent,
    alternate: oldFiber,
    effectTag: typeMap[effectTag || 0],
  }
}

function update() {
  // 使用闭包来存储函数组建,当组建需要更新的时候,再次使用该组建fiber
  let fiber = saveFunctionComponent;
  return function () {
    nextWorkOfUnit = root = {
      ...fiber,
      // 更新effectTag为update
      effectTag: FIBER_UPDATE,
      alternate: fiber,
    }
  }
}

// 用于记录当前函数组建state的指正
let stateIndex
function useState(initState) {
  let oldStateHook = saveFunctionComponent?.alternate?.useStates?.[stateIndex]
  let stateHook = {
    state: oldStateHook ? oldStateHook.state : initState,
    pool: oldStateHook ? oldStateHook.pool : []
  }

  stateHook.pool.forEach((update) => {
    let recent = update(stateHook.state)
    if (recent != oldStateHook.state) {
      stateHook.state = recent
    }
  })
  // 当state更新函数执行完成,则将其清空
  stateHook.pool = []

  if (stateIndex === 0) {
    // 组建初始化时,同时也将新fiber的state初始化
    saveFunctionComponent.useStates = []
  }
  // 何时能够做push操作?
  // 在函数初始化的时候
  // 但凡执行了useState函数,都是要对输出做一个push操作
  // 如何知道函数是否初始化?
  // stateIndex 为0的时候证明在做初始化
  // 但是有一点是,不能在旧的useStates上进行操作,需要在新数组上做操作
  saveFunctionComponent.useStates.push(stateHook)
  stateIndex += 1

  function setState(newState) {
    // stateHook.state = newState(stateHook.state)
    // 当修改的数据与上个数据一样,则不更新
    //! 此处需要优化,如果newState为函数并且返回的数据与就数据相同,则不更新
    if (newState === stateHook.state) return false
    stateHook.pool.push(isFunction(newState) ? newState : () => newState)

    nextWorkOfUnit = root = {
      ...saveFunctionComponent,
      // 更新effectTag为update
      effectTag: FIBER_UPDATE,
      alternate: saveFunctionComponent,
    }
  }
  return [stateHook.state, setState]
}

// 用于存储effect
let effects
function useEffect(fun, deps) {
  const effectHook = {
    fun,
    deps
  }
  effects.push(effectHook)
  saveFunctionComponent.effectHooks = effects
}

requestIdleCallback(workLoop);

const React = {
  useState,
  update,
  render,
  useEffect,
  createElement
}

export default React