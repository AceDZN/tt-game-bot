import { SerpAPI } from 'langchain/tools'

const SerpAPITool = () => {
  const _SerpAPI = new SerpAPI(process.env.SERP_API_KEY, {
    baseUrl: 'http://localhost:3000/agents',
    location: 'Tel Aviv, Israel',
    hl: 'en',
    gl: 'us',
  })
  _SerpAPI.returnDirect = true
  return _SerpAPI
}

export default SerpAPITool

