import React from '../core/React.js'
import { ACTIVE } from './index.jsx'

function TodoItem({todo, del,complete }){
  const {id, text, type} = todo
  return (
    <li id={id}>{text}
      {type === ACTIVE ? <button type="button" onClick={() => complete(id)}>complete</button> : undefined}
      <button type="button" onClick={() => del(id)}>del</button>
    </li>)
}

export default TodoItem