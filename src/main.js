import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import llmService from './llmService'

async function init() {
  const llmObj = await llmService("you are an expert story teller")
  document.getElementById('start').onclick = async () => {
    try {
      console.log(document.getElementById('tb1').value)
      const response = await llmObj.callLLM(document.getElementById('tb1').value)
      console.log("RESP", response)
      document.getElementById('container').innerHTML = response
    } catch (err) {
      console.log("Error", err)
    }
  }
}
document.querySelector('#app').innerHTML = `
  <div id = "container" style = "position: absolute; width: 500px;height: 500px;left: 10%; top: 20%">
  </div>   
  <button id = "start" style = "position: absolute; left: 40%; top: 0px">Start</button>
  <input type = "text" id = "tb1" style = "position: absolute; left: 0px; top: 0px, height: 80px, width: 200px">
`

init()

