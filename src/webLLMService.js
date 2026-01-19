import { CreateMLCEngine } from "@mlc-ai/web-llm"

const MODEL = 'Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC'

const webLLMService = async (systemPrompt) => {

    let isModelLoaded = false
    const initProgressCallback = (progress) => {
        console.log("Loading model with progress", progress)
    }
    const engine = await CreateMLCEngine(MODEL, { initProgressCallback })
    const messages = [
        {
            role: "system", content: systemPrompt,
        }
    ]
    return {
        engine,
        isModelLoaded,
        stream(message, cb) {
            messages.push({
                role: "user", content: message
            })
            engine.chat.completions.create({
                stream: true,
                temperature: 1,
                messages
            }).then(async (chunks) => {
                let assistantContent = ""
                for await (const chunk of chunks) {
                    const token = chunk.choices[0].delta.content || ""
                    cb(token)
                    assistantContent = `${assistantContent}${token}`
                }
                messages.push({
                    role: "assistant",
                    content: assistantContent
                })
            })
        }
    }
}

export default webLLMService