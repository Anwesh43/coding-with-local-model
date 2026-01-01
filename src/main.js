import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import llmService from './llmService'
import { CODING_SYSTEM_PROMPT } from './prompts'
import indentCode from './utils'

class StreamResult {
  result = ""
  addWord(word) {
    if (this.result !== "") {
      this.result = `${this.result} ${word}`
    } else {
      this.result = `${word}`
    }
  }
  getWord() {
    return this.result
  }

  reset() {
    this.result = ""
  }
}

async function init() {
  try {
    const availability = await LanguageModel.availability()
    if (availability !== "available") {
      throw new Error("Language model not available")
    }
    console.log("AVAILABLITY", availability)
    const llmObj = await llmService(CODING_SYSTEM_PROMPT)
    const sr = new SpeechRecognition()
    const streamResult = new StreamResult()
    sr.onresult = (event) => {
      console.log(event.results)
      const transcription = event.results[0][0].transcript
      streamResult.reset()
      llmObj.stream(transcription, (text) => {
        streamResult.addWord(text)
        const html = indentCode(streamResult.getWord().replace("javascript", '').replaceAll("```", "").replaceAll("\n", '').replace(/\/\*\*[\s\S]*?\*\//g, '').trim())
        document.getElementById('container').innerHTML = html
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
      streamResult.reset()
      console.log("Started streaming")
      llmObj.stream(document.getElementById('tb1').value, (text) => {
        streamResult.addWord(text)
        const html = indentCode(streamResult.getWord().replace("javascript", '').replaceAll("```", "").replaceAll("\n", '').replace(/\/\*\*[\s\S]*?\*\//g, '').trim())
        document.getElementById('container').innerHTML = html
      })
    }

    document.getElementById('speak').onclick = () => {
      sr.start()
    }
  } catch (ex) {
    alert("Please open in google chrome with recent version and enable 'Prompt api for gemini nano' in chrome://flags")
  }
}
document.querySelector('#app').innerHTML = `
  <div id = "container">
  </div> 
  <div id = "left-container">
    <div class = "input-container">
      <textarea rows="4" cols = "50" id = "tb1" placeholder = "Enter your prompt here..." autofocus>      
      </textarea>  
      <div id = "button-container">
        <button id = "start" style = "position: absolute; left: 10%; background:none; display: none">Generate Code</button>
        <button id = "startStream">Generate Code</button>
        <button id = "speak">Speak</button>
      </div>
    </div>
  </div>
`

init()

