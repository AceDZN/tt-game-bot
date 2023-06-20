import helpText from '../../app/prompts/help'
import returnAsMarkdown from '../../utils/returnAsMarkdown'
import { OpenAI } from 'langchain/llms/openai'
import SSE from 'express-sse'

const sse = new SSE()
const generateStreamingResponse = async (res) => {
  const response = { text: res.text }
  const htmlResponse = await returnAsMarkdown(res.text)

  return {
    output: response,
    html: htmlResponse,
  }
}
let og_text = ''

const processToken = (token) => {
  // add code

  return token.replace(/\\n/g, '\n').replace(/"/g, '')
}
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt: input } = req.body

    if (!input) {
      throw new Error('No input')
    }
    // Initialize model
    const chat = new OpenAI({
      modelName: 'gpt-3.5-turbo',
      streaming: true,
      maxTokens: 1000,
      callbacks: [
        {
          handleLLMNewToken(token) {
            const proccessed_token = processToken(token)
            const text = og_text + proccessed_token
            og_text = text
            const html = returnAsMarkdown(text).then((html) => {
              const data = { token: proccessed_token, text: text, html: html }
              sse.send(data, 'newToken')
            })
          },
        },
      ],
    })

    // create the prompt
    const prompt = `You are TinyBot, an advanced digital learning companion proficient in the Socratic dialogue method.the following TEXT_BLOCK contain the base instructions for the user, you need to pass it as it is. Remember to format your response as a clean, well-structured markdown file, make sure to wrap links (https://tinytap.freshdesk.com/) in their correct markdown format (use the link as the text) and code blocks ( /restart command) with triple backticks. now here is the text you should explain the user, make sure to respond in its original structure. TEXT_BLOCK: ${helpText}. It's very important that you'll respond with a markdown file and with valid link to the help center. `

    // call frontend to backend
    chat.call(prompt).then((response) => {
      //console.log({ method: 'END', res })
      sse.send(null, 'end')
    })
    //console.log({ method: 'POST', res })
    return res.status(200).json({ result: 'OK' })
  } else if (req.method === 'GET') {
    //console.log({ method: 'GET', res: res })
    const text = generateStreamingResponse(res)
    //console.log({ text })

    sse.init(req, res)
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

/*
export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('initializing help!')
    try {
      const { prompt } = req.body
      if (!prompt) {
        throw new Error('No prompt provided')
      }

      const htmlResponse = await returnAsMarkdown(helpText)
      console.log({ htmlResponse })

      return res.status(200).json({
        output: { text: helpText },
        html: htmlResponse,
      })
    } catch (error) {
      console.log('error', error)
      return res.status(500).json({ error: error.message || error.toString() })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

*/

