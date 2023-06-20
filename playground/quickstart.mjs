import { OpenAI } from 'langchain/llms/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { PromptTemplate } from 'langchain/prompts'
import { LLMChain } from 'langchain/chains'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { SerpAPI } from 'langchain/tools'
import { Calculator } from 'langchain/tools/calculator'
import { BufferMemory } from 'langchain/memory'
import { ConversationChain } from 'langchain/chains'
import { PlanAndExecuteAgentExecutor } from 'langchain/experimental/plan_and_execute'
import { exec } from 'child_process'

// export OPENAI_API_KEY=<>
// export SERPAPI_API_KEY=<>
// Replace with your API keys!

// to run, go to terminal and enter: cd playground
// then enter: node quickstart.mjs
console.log('Welcome to the LangChain Quickstart Module!')

const template =
  'You are a director of social media with 30 years of experience. Please give me some ideas for content I should write about regarding {topic}? The content is for {socialplatform}. Translate to {language}'

const prompt = new PromptTemplate({
  template: template,
  inputVariables: ['topic', 'socialplatform', 'language'],
})
/*
const formattedPromptTemplate = await prompt.format({
  topic: 'Artificial intelegence',
  socialplatform: 'Facebook',
  language: 'Hebrew',
})
*/

/*
const model = new OpenAI({ temperature: 0.9 })
const chain = new LLMChain({ llm: model, prompt: prompt })

const resChain = await chain.call({
  topic: 'artificial intelegence',
  socialplatform: 'facebook',
  language: 'english',
})

console.log({ resChain })

*/
const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY, {
    location: 'Dallas, Texas, United States',
    hl: 'en',
    gl: 'us',
  }),
  new Calculator(),
]
/*
const agentModel = new OpenAI({ temperature: 0, modelName: 'text-davinci-003', maxTokens: 100 })
console.log('process.env.SERPAPI_API_KEY', process.env.SERPAPI_API_KEY)


const executor = await initializeAgentExecutorWithOptions(tools, agentModel, {
  agentType: 'zero-shot-react-description',
  verbose: true,
  maxIterations: 3,
})

const input = 'what is opencampus.xyz?'

const result = await executor.call({ input })
console.log(result)
*/
/****
 * Plan and Action Agent
 */
/*
const chatModel = new ChatOpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo', verbose: true })

const chatExecutor = PlanAndExecuteAgentExecutor.fromLLMAndTools({ llm: chatModel, tools: tools })
const result = await chatExecutor.call({
  input: 'who is the current PM of Israel? how much time does he in a PM? double that time.',
})

console.log({ result })
*/
// Memory

const llm = new OpenAI({})
const memory = new BufferMemory({})
const conversationChain = new ConversationChain({ llm: llm, memory: memory })
const resultConv = await conversationChain.call({
  input: 'Hey, my name is Alex Sindalovsky',
})
console.log('Hey, my name is Alex Sindalovsky')
console.log({ resultConv })

const resultConv2 = await conversationChain.call({
  input: 'what is my name?',
})
console.log('what is my name?')
console.log({ resultConv2 })

