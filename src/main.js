import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import llmService from './llmService'
import { CODING_SYSTEM_PROMPT } from './prompts'
import indentCode from './utils'
import { sanitizeInput, validateInput, escapeHtml, sanitizeHtmlOutput } from './security'

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
      try {
        const sanitized = sanitizeInput(transcription)
        streamResult.reset()
        llmObj.stream(sanitized, (text) => {
          streamResult.addWord(text)
          // Format code first, then sanitize HTML output to prevent XSS
          const codeText = streamResult.getWord().replace("javascript", '').replaceAll("```", "").replaceAll("\n", '').replace(/\/\*\*[\s\S]*?\*\//g, '').trim()
          const html = indentCode(codeText)
          const sanitizedHtml = sanitizeHtmlOutput(html)
          document.getElementById('container').innerHTML = sanitizedHtml
        })
      } catch (error) {
        alert(error.message || 'Invalid input')
      }
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

