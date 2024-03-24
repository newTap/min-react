import React from './react.js'

const ReactDom = {
  createdRoot(id) {
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