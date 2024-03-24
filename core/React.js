function createdElement(type, props, ...children){
  let dom = document.createElement(type);
  for (let key in props){
    dom.setAttribute(key, props[key])
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
  container.appendChild(node)
}


const React = {
  render,
  createdElement
}

export default React