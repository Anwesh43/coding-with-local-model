import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import llmService from './llmService'

async function init() {
  const llmObj = await llmService("you are an expert javascript programmer you will return formatted code with proper indentation everytime and nothing else. You should output code which can be executed in compiler don't give javascript with backtick")
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
  <div id = "container" style = "position: absolute; width: 800px;height: 500px;left: 10%; top: 35%">
  </div>   
  <button id = "start" style = "position: absolute; left: 52%; top: 20px">Start</button>
  <button id = "startStream" style = "position: absolute; left: 60%; top: 20px">Start Stream</button>
  <button id = "speak" style = "position: absolute; left: 68%; top: 20px">Speak</button>
  <textarea rows="5" cols = "70" id = "tb1" style = "position: absolute; left: 50px; top: 20px;">
`

init()

