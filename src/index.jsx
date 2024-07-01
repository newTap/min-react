
import React from '../core/React.js'
import TodoItem from './TodoItem.jsx'

export const ACTIVE = "active"
export const ACHIEVE = "achieve"

const  Todo = () => {
  const [inputValue, setInputValue] = React.useState('')
  const [todos, setTodo] = React.useState([])
  const [filteredTodos, setFilteredTodo] = React.useState([])
  const [statue, setStatus] = React.useState('all')


  function add (){
    if(!inputValue)return false
    let newTodos = [...todos, {text: inputValue, type:ACTIVE, id: crypto.randomUUID()}]
    setTodo(() => newTodos)
    setInputValue('')
  }

  function del(todoId){
    const current =  todos.filter(({id}) => id !== todoId)
    setTodo(current)
  }

  function complete(todoId){
    let newTodos = todos.map((todo) => {
      if(todo.id === todoId ) todo.type = ACHIEVE
        return todo
    })
    setTodo(() => newTodos)
  }

  function changeStatus(type){
    setStatus(type)
  }

  function save(){
    localStorage.setItem('saveTodo', JSON.stringify(todos));
    alert('save todo')
  }

  React.useEffect(() => {
    let saveTodo = localStorage.getItem('saveTodo')
    if(saveTodo){
      setTodo(() => {
        return JSON.parse(saveTodo)
      })
    }
  },[])

  React.useEffect(() => {
    if(statue === 'all'){
      setFilteredTodo([...todos])
    }else{
      const filter = todos.filter(({type}) => {
        return type === statue
      })
      setFilteredTodo([...filter])
    }
  },[statue, todos])

  return (
  <div>
   <div>
    <input type="text" class={inputValue} value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
    <button type="button" onClick = {add}>add</button>
   </div>
   <div>
    <button type="button" onClick={save}>save</button>
    <button type="button" onClick={() => changeStatus('all')}>all</button>
    <button type="button" onClick={() => changeStatus(ACHIEVE)}>{ACHIEVE}</button>
    <button type="button" onClick={() => changeStatus(ACTIVE)}>{ACTIVE}</button>
   </div>
   <div>
    <ul>
      {filteredTodos.map((todo) => {
        return (
          <TodoItem todo={todo} del={del} complete={complete}/>
        )
      })}
    </ul>
   </div>
  </div>
)}

export default Todo



