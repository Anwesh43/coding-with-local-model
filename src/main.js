import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import llmService from './llmService'

async function init() {
  const llmObj = await llmService("you are an expert javascript programmer you will return formatted code with proper indentation everytime and nothing else. You should output code which can be executed in compiler don't give code inside. Note: the code must be formatted")
  const sr = new SpeechRecognition()
  sr.onresult = (event) => {
    console.log(event.results)
    const transcription = event.results[0][0].transcript
    llmObj.stream(transcription, (text) => {
      const html = document.getElementById('container').innerHTML
      document.getElementById('container').innerHTML = `${html === '' ? '' : `${html} `}${text}`
    })
  }
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
  document.getElementById('startStream').onclick = async () => {
    document.getElementById('container').innerHTML = ''
    console.log("Started streaming")
    llmObj.stream(document.getElementById('tb1').value, (text) => {
      const html = document.getElementById('container').innerHTML
      document.getElementById('container').innerHTML = `${html === '' ? '' : `${html} `}${text}`
    })
  }

  document.getElementById('speak').onclick = () => {
    sr.start()
  }
}
document.querySelector('#app').innerHTML = `
  <div id = "container">
  </div> 
  <div id = "left-container">
    <textarea rows="4" cols = "50" id = "tb1">
        
    </textarea>  
    <div id = "button-container">
      <button id = "start" style = "position: absolute; left: 10%; background:none; display: none">Generate Code</button>
      <button id = "startStream">Generate Code</button>
      <button id = "speak">Speak</button>
    </div>
  </div>
`

init()

