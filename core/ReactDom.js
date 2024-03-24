import React from './React.js'

const ReactDom = {
  createdRoot(id) {
    let container = typeof id === 'string' ?document.querySelector(id) : id
    return {
      render: (node) => {
        console.log()
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