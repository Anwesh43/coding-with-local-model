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

        }
    }
}

export default llmService 