// /pages/api/transcript_chat.js
import { YoutubeTranscript } from 'youtube-transcript'
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts'
import extractVideoId from '../../utils/extractVideoId'
import getVideoMetaData from '../../utils/getVideoMetaData'
import ResearchAgent from '../../agents/ResearchAgent'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { LLMChain } from 'langchain'
import { remark } from 'remark'
import html from 'remark-html'
import returnAsMarkdown from '../../utils/returnAsMarkdown'

// Global Variables
let chain
let memory
let chatHistory = []
let metadataString = ''
let transcript = ''
let research

const tinytapPromptPrefix = `TinyTap is an easy-to-use educational game maker. Through its web game creator, you can design a game composed of up to 20 slides. Each slide has two primary elements: a 'stage' that houses an activity, and a 'layout' that determines the design.
When setting up the stage, the creator can use several kinds of elements, including TinyTap's built-in 'stickers,' user-uploaded images, or text.
The creator can choose from various activity types:
Sound Board: The creator designates multiple areas on the screen to act as clickable sound triggers. Each area can play a unique recorded sound when clicked.
Questions: The creator records several questions, each with a correct and incorrect response. Depending on the player's answer, a predetermined area triggers either the 'right' or 'wrong' recorded response.
Puzzle: The creator designates multiple areas on the stage and converts them into puzzle pieces. Each piece can contain a recording that plays when the player drags it.
Video: A slide that features an embedded video from YouTube. The creator needs to provide a YouTube link for this.
Reading: A slide that plays a pre-recorded narration when viewed, requiring no user interaction.
Type: The creator designates multiple areas on the stage as text fields. These fields check for specified 'answers' input by the user.
    `

// Initialize Chain with Data
const initChain = async (transcript, metadata, research, input) => {
  const fixedTinyTapSuffix = `
    ${tinytapPromptPrefix}
    Please draft a game specification for an educational TinyTap game on the topic of {input}. The game is intended for a young audience, so it needs to be both engaging and informative. Include elements such as sustain life advice, questions, and research ideas. 
    Design a mix of informative slides and activity-based slides, with some slides incorporating both aspects. 
    To effectively design this game, follow these steps:
    Begin by brainstorming and outlining the game development process meticulously, considering each developmental stage.
    Assemble a well-structured markdown file that includes a total of 10 slides for the game's specifications.
    \nEach line should end with a line break tag ('\\n') to facilitate future parsing.
    In each slide, include the proposed graphic components such as background images, gifs, on-screen text, and text layout. Describe any interactive elements like puzzles, questions, or audio recordings.
    Ensure to provide full text and transcripts for all audio content or voice-overs. Be sure to describe and write out the exact phrasing to be used during any voice recording.
    To aid you in designing the game, refer to the supplied video metadata: {metadata}, and video transcript: {transcript}. Furthermore, the provided research materials: {research} can be used for content creation and design inspiration.
    Remember, the primary objective is to create a game that is not only educational but also fun and captivating for children. it should be well punctuated and grammatically correct, with a line break tag on each end of line.
  `
  try {
    const llm = new ChatOpenAI({ temperature: 0.7, modelName: 'gpt-3.5-turbo' })
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(`${fixedTinyTapSuffix}`),
      HumanMessagePromptTemplate.fromTemplate(
        '{input}. remember to use the video transcript and the research as reference.',
      ),
    ])

    const question = `I need you to come with  draft a game spec for building a lighthearted, joking manner TinyTap educational game about ${input}.`

    chain = new LLMChain({ prompt: chatPrompt, llm })

    const response = await chain.call({ metadata: metadataString, transcript, research, input: question })
    chatHistory.push({ role: 'assistant', content: response.text })

    return response
  } catch (error) {
    console.error(`An error occurred during the initialization of the Chat Prompt: ${error.message}`)
    throw error // rethrow the error to let the calling function know that an error occurred
  }
}

export default async function handler(req, res) {
  const { prompt, topic, firstMsg } = req.body
  console.log(`Prompt: ${prompt} Topic: ${topic}`)

  if (chain === undefined && !prompt.includes('https://www.youtube.com/watch?v=')) {
    return res.status(400).json({
      error: 'Chain not initialized. Please send a YouTube URL to initialize the chain.',
    })
  }
  chatHistory.push({
    role: 'user',
    content: prompt,
  })

  // Just like in the previous section, if we have a firstMsg set to true, we need to initialize with chain with the context
  if (firstMsg) {
    console.log('Received URL')

    try {
      // Get context from YouTube URL
      const videoId = extractVideoId(prompt)

      const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en_US', country: 'US' })
      //console.log({ transcriptResponse })

      // Initialize chain with transcript, metadata, research, and topic
      if (!transcriptResponse) {
        return res.status(400).json({ error: 'No transcript found for this video' })
      }

      transcriptResponse.forEach((line) => {
        transcript += `${line.text} `
      })
      console.log({ videoId, transcript })

      //Video Meta Data
      const metadata = await getVideoMetaData(videoId)
      metadataString = JSON.stringify(metadata, null, 2)
      console.log({ metadata })

      research = await ResearchAgent(topic)

      console.log({ research })
      // return res.status(200).json({ output: research });
      // Create Chain
      const response = await initChain(transcript, metadata, research, topic)
      const htmlResponse = await returnAsMarkdown(response.text)
      return res.status(200).json({
        output: response,
        html: htmlResponse,
        chatHistory,
        transcript,
        metadata,
        research,
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'An error occurred while fetching transcript' })
    }
  } else {
    // Very similar to previous section, don't worry too much about this just copy and paste it from the previous section!
    const question = prompt
    console.log({ question, chain })

    try {
      // do stuff
      const metadata = JSON.parse(metadataString)
      const response = await chain.call({ transcript, metadata, research, input: question })
      chatHistory.push({ role: 'assistant', content: response.text })
      const htmlResponse = await returnAsMarkdown(response.text)
      // just make sure to modify this response as necessary.
      return res.status(200).json({
        output: response,
        html: htmlResponse,
        metadata: metadata,
        transcript,
        chatHistory,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'An error occurred during the conversation.' })
    }
  }
}

