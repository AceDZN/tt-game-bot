// /pages/api/transcript.js
import { YoutubeTranscript } from 'youtube-transcript'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAI } from 'langchain'
import { BufferMemory, ChatMessageHistory } from 'langchain/memory'

// Global variables
let chain
let memory
const chatHistory = []

// DO THIS SECOND
const initializeChain = async (initialPrompt, transcript) => {
  try {
    console.log({ chatHistory })
    const model = new ChatOpenAI({ temperature: 0.8, modelName: 'gpt-3.5-turbo' })
    const vectorStore = await HNSWLib.fromDocuments([{ pageContent: transcript }], new OpenAIEmbeddings())
    memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(chatHistory),
      returnMessages: true, //optional
      memoryKey: 'chat_history',
    })
    //chain = new ConversationChain({ llm: model, memory })
    // Initialize the chain
    chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), { verbose: true /*, memory*/ })
    // Initialize the vector store
    const response = await chain.call({ question: initialPrompt, chat_history: chatHistory })
    console.log({ response })
    chatHistory.push({
      role: 'assistant',
      content: response.text,
    })
    return response
  } catch (error) {
    console.error(error)
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // DO THIS FIRST
    const { prompt, firstMsg } = req.body

    // Then if it's the first message, we want to initialize the chain, since it doesn't exist yet
    if (firstMsg) {
      try {
        const initialPrompt = `Translate this transcript to English if needed: ${prompt}. afterwards, give me a summary of the transcript`
        chatHistory.push({
          role: 'user',
          content: initialPrompt,
        })

        // YouTube transcript
        const transcriptResponse = await YoutubeTranscript.fetchTranscript(prompt, { lang: 'en_US', country: 'US' })

        if (!transcriptResponse) {
          return res.status(400).json({ error: 'Failed to get transcript' })
        }
        console.log({ transcriptResponse })

        let transcript = ''
        transcriptResponse.forEach((item) => {
          transcript += item.text + ' '
        })
        transcript.replace('  ', ' ')
        const response = await initializeChain(initialPrompt, transcript)
        console.log('Chain:', chain)
        console.log(response)
        // And then we'll jsut get the response back and the chatHistory
        return res.status(200).json({ output: { ...response, text: response.text || 'wait for it...' }, chatHistory })
      } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'An error occurred while fetching transcript' })
      }

      // do this third!
    } else {
      // If it's not the first message, we can chat with the bot

      try {
        console.log('Asking:', prompt)
        console.log('Chain:', chain)

        // First we'll add the user message
        chatHistory.push({
          role: 'user',
          content: prompt,
        })
        // Then we'll pass the entire chat history with all the previous messages back
        const response = await chain.call({
          question: prompt,
          chat_history: chatHistory,
        })
        // And we'll add the response back as well
        chatHistory.push({
          role: 'assistant',
          content: response,
        })
        console.log({ response })
        return res.status(200).json({ output: { ...response, text: response.text || 'KUKU???' }, chatHistory })
      } catch (error) {
        // Generic error handling
        console.error(error)
        res.status(500).json({ error: 'An error occurred during the conversation.' })
      }
    }
  }
}

