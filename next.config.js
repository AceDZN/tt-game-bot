/** @type {import('next').NextConfig} */
// https://js.langchain.com/docs/getting-started/install#vercel--nextjs
// To use LangChain with Next.js (either with app/ or pages/), add the following to your next.config.js to enable support for WebAssembly modules (which is required by the tokenizer library @dqbd/tiktoken):
const nextConfig = {
  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }

    return config
  },
  // Add env { API_KEY: process.env.API_KEY}
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    PINECONE_INDEX: process.env.PINECONE_INDEX,
    SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
}

module.exports = nextConfig

