const llmService = async (systemPrompt) => {
    const messages = [
        {
            "role": "system",
            "content": systemPrompt,
        }

    ]
    const session = await LanguageModel.create({
        initialPrompts: messages,
        language: 'en',
        expectedInputs: [
            {
                type: "text",
                languages: ['en']
            }
        ],
        expectedOutputs: [
            {
                type: "text",
                languages: ["en"]
            }
        ]
    })
    return {
        async callLLM(prompt) {
            messages.push({
                role: "user",
                content: prompt
            })
            const response = await session.prompt(messages)
            messages.push({
                role: "assistant",
                content: response,
            })
            return response

        },

        async stream(prompt, cb) {
            messages.push({
                role: "user",
                content: prompt
            })
            const chunks = []
            const response = await session.promptStreaming(messages)
            for await (const chunk of response) {
                cb(chunk)
                chunks.push(chunk)
            }
            messages.push({
                role: "assistant",
                content: chunks.join("")
            })
        }
    }
}

export default llmService 