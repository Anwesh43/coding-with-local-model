import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import llmService from './llmService'
import webLLMService from './webLLMService'
import { CODING_SYSTEM_PROMPT } from './prompts'
import indentCode from './utils'
import { sanitizeInput, validateInput, escapeHtml, sanitizeHtmlOutput } from './security'

class StreamResult {
  result = ""
  addWord(word) {
    if (this.result !== "") {
      this.result = `${this.result}${word}`
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
  let llmObj = null
  try {
    const availability = await LanguageModel.availability()
    if (availability !== "available") {
      document.getElementById('loading').style.visibility = 'visible'
      llmObj = await webLLMService(CODING_SYSTEM_PROMPT)

      console.log("LLMOBJ", llmObj)
    } else {
      llmObj = await llmService(CODING_SYSTEM_PROMPT)
      console.log("AVAILABLITY", availability)
    }
  } catch (ex) {

    document.getElementById('loading').style.visibility = 'visible'
    llmObj = await webLLMService(CODING_SYSTEM_PROMPT)
    document.getElementById('loading').style.visibility = 'hidden'
    console.log("LLMOBJ", llmObj)
  }
  const streamResult = new StreamResult()
  if (window.SpeechRecognition) {
    const sr = new SpeechRecognition()

    sr.onresult = (event) => {
      console.log(event.results)
      const transcription = event.results[0][0].transcript
      document.getElementById('tb1').value = transcription
      document.getElementById('startStream').disabled = false
      try {
        const sanitized = sanitizeInput(transcription)
        streamResult.reset()
        llmObj.stream(sanitized, (text) => {
          streamResult.addWord(text)
          // Format code first, then sanitize HTML output to prevent XSS
          const codeText = streamResult.getWord().replace("javascript", '').replaceAll("```", "").replaceAll("\n", '').replace(/\/\/.*/g, '').replace(/\/\*\*[\s\S]*?\*\//g, '').trim()
          const html = indentCode(codeText)
          const sanitizedHtml = sanitizeHtmlOutput(html)
          document.getElementById('container').innerHTML = sanitizedHtml
          //console.log("CodeText", streamResult)
        })
      } catch (error) {
        alert(error.message || 'Invalid input')
      }
    }
  } else {
    document.getElementById('speak').style.display = 'none'
  }
  document.getElementById('start').onclick = async () => {
    try {
      const input = document.getElementById('tb1').value
      const validation = validateInput(input)
      if (!validation.isValid) {
        alert(validation.error || 'Invalid input')
        return
      }
      console.log(validation.sanitized)
      const response = await llmObj.callLLM(validation.sanitized)
      console.log("RESP", response)
      // Escape HTML in response to prevent XSS
      const escapedResponse = escapeHtml(response)
      document.getElementById('container').innerHTML = escapedResponse.replace(/\n/g, '<br>')
    } catch (err) {
      console.log("Error", err)
      alert(err.message || 'An error occurred')
    }
  }
  document.getElementById('startStream').onclick = async () => {
    const text = document.getElementById('tb1').value
    const validation = validateInput(text)
    if (!validation.isValid) {
      alert(validation.error || 'Invalid input')
      return
    }
    streamResult.reset()
    console.log("Started streaming")
    llmObj.stream(validation.sanitized, (text) => {
      streamResult.addWord(text)
      // Format code first, then sanitize HTML output to prevent XSS
      const codeText = streamResult.getWord().replace("javascript", '').replaceAll("```", "").replaceAll("\n", '').replace(/\/\*\*[\s\S]*?\*\//g, '').trim()
      const html = indentCode(codeText)
      const sanitizedHtml = sanitizeHtmlOutput(html)
      document.getElementById('container').innerHTML = sanitizedHtml
    })
  }

  document.getElementById('speak').onclick = () => {
    document.getElementById('startStream').disabled = true
    document.getElementById('tb1').value = "Listening your coding problem..."
    sr.start()
  }

  document.getElementById('tb1').oninput = function () {
    this.style.height = 'auto'
    this.style.height = this.scrollHeight + "px";
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

document.body.innerHTML = `${document.body.innerHTML}
  <div id="loading" class="loading">
    Loading&#8230;     
  </div>`

init()

