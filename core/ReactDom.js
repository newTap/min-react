import React from './React.js'

const ReactDom = {
  // 创建根组建
  createRoot(id) {
    let container = typeof id === 'string' ?document.querySelector(id) : id
    return {
      render: (node) => {
        if(!container){
          console.error('container is undefined')
          return false
        }
        React.render(node, container)
      }
    }
  }
}

export default ReactDom