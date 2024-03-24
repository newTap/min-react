import React from './core/react.js'
import ReactDom from './core/ReactDom.js'

const app = React.createdElement('div', {id:'name'}, 'hello world')

ReactDom.createdRoot("#root").render(app)