import ReactDom from './core/ReactDom.js'
import App from './App.jsx'

function fn (res) {
  console.log('2222')
  // while (res.timeRemaining()<10){
    console.log('11',res.timeRemaining());
  // }
//  requestIdleCallback(fn)
}

 requestIdleCallback(fn)

ReactDom.createdRoot("#app").render(App)