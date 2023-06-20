import { ChatOpenAI } from 'langchain/chat_models/openai'
import { LLMChain } from 'langchain/chains'
import { ZeroShotAgent } from 'langchain/agents'
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts'
import { AgentExecutor } from 'langchain/agents'
import SerpAPITool from '../tools/SerpAPI'
import WebBrowserTool from '../tools/WebBrowser'
import { DynamicTool } from 'langchain/tools'

const transcribeVideo = async (videoUrl) => {
  const videoId = extractVideoId(videoUrl)
  let transcript = ''
  console.log({ videoId }, '<<<<< Video Id >>>>>>')
  const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en_US', country: 'US' })

  console.log({ transcriptResponse })

  // Initialize chain with transcript, metadata, research, and topic
  if (!transcriptResponse) {
    return false
  }

  transcriptResponse.forEach((line) => {
    transcript += `${line.text} `
  })
  return transcript
}

const ResearchAgent = async (topic) => {
  //  console.log({ topic })

  try {
    // Tools
    const SerpAPI = SerpAPITool()
    const WebBrowser = WebBrowserTool()
    const VideoTool = new DynamicTool({
      name: 'YouTube video transcriber',
      description:
        'call this to get a transcription of a youtube video or if you need to get context from video. input should be a youtube video url.',
      func: transcribeVideo,
    })
    const tools = [SerpAPI, WebBrowser]

    const promptTemplate = ZeroShotAgent.createPrompt(tools, {
      prefix: `As a top-tier K-12 educator, you are researching a particular topic for your classroom instruction. Your goal is to gain a deep understanding of the topic I'll provide. You have access to the following tools:`,
      suffix: `To source the best information about ${topic} for your class, consider not just the factual content, but also what elements could make learning fun and engaging. Look for interactive materials, engaging visuals, real-world examples, and game-based learning opportunities related to ${topic}.`,
    })

    // Prompt Template
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      new SystemMessagePromptTemplate(promptTemplate),
      HumanMessagePromptTemplate.fromTemplate(`{input}`),
    ])
    const chat = new ChatOpenAI({})

    // LLM Chain - Template + Model
    const llmChain = new LLMChain({
      prompt: chatPrompt,
      llm: chat,
    })

    // Agent  - Tools, LLM, Prompt Template
    const agent = new ZeroShotAgent({ llmChain, allowedTools: tools.map((tool) => tool.name) })

    const executor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      returnIntermediateSteps: false,
      maxIterations: 3,
      verbose: true,
    })

    const result = await executor.run(`Do research about ${topic}`)
    //console.log({ result })

    // Chat OpenAI (model)

    return result
  } catch (err) {
    console.error(err)
  }
}

export default ResearchAgent

