'use client'

import React, { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import PromptBox from '../components/PromptBox'
import ResultWithSources from '../components/ResultWithSources'
import Title from '../components/Title'
import TwoColumnLayout from '../components/TwoColumnLayout'
import returnAsMarkdown from '../../utils/returnAsMarkdown'

/**
 *
 * Module 5: AI Content Generator
 *
 * Use this to create new content from a piece of content!
 *
 */
const ContentGenerator = () => {
  // Follw up: Write me a tweet about pedro pascal.
  const [prompt, setPrompt] = useState('https://www.youtube.com/watch?v=ODni_Bey154')
  const [topic, setTopic] = useState('Plastic Pollution')
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=ODni_Bey154')
  const [error, setError] = useState(null)
  const [firstMsg, setFirstMsg] = useState(true)
  const botText = `Hi there!
  I'm your personal TinyTap game generator.
  If you give me a **YouTube URL** and a **topic**, I can transform it into a unique TinyTap game script.
  Send me a **YouTube URL** to get started.`
  const [source, setSource] = useState(null)
  const [messages, setMessages] = useState('')
  const handleBotFirstMessage = async () => {
    const botFirstMessage = {}
    botFirstMessage.html = await returnAsMarkdown(botText)
    botFirstMessage.text = botText
    setMessages((prevMessages) => [...prevMessages, botFirstMessage])
  }

  const handlePromptChange = (e) => {
    setPrompt(e.target.value)
  }
  const handleTopicChange = (e) => {
    setTopic(e.target.value)
  }

  // Make sure to change the API route
  const handleSubmit = async () => {
    try {
      // Push the user's message into the messages array
      setMessages((prevMessages) => [...prevMessages, { text: prompt, type: 'user', sourceDocuments: null }])
      let response
      if (prompt.toLowerCase() === '/help') {
        response = await fetch(`/api/help`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: prompt }),
        })

        if (source) {
          source.close()
        }
        const newSource = new EventSource('/api/help')
        setSource(newSource)
        newSource.addEventListener('newToken', (e) => {
          const data = JSON.parse(e.data)
          setMessages((prevMessages) => {
            let lastMessage = prevMessages[prevMessages.length - 1]
            let messages = [...prevMessages]

            if (lastMessage.type === 'bot') {
              messages = prevMessages.slice(0, prevMessages.length - 1)
            }

            console.log('setMessages', lastMessage, data)

            return [
              ...messages,
              {
                text: data?.text,
                html: data?.html,
                type: 'bot',
              },
            ]
          })
        })
        newSource.addEventListener('end', (e) => {
          newSource.close()
        })
      } else {
        response = await fetch(`/api/game-generator`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: prompt, video: videoUrl, topic: topic, firstMsg }),
        })
      }

      const searchRes = await response.json()

      console.log({ searchRes })

      if (!response.ok) {
        throw new Error(searchRes.error)
      }
      /*
      // Push the response into the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: searchRes.output.text,
          html: searchRes.html,
          type: 'bot',
        },
      ])
      setFirstMsg(false)
      setPrompt('')
      setError('')
      */
    } catch (err) {
      console.error(err)
      setError('Error fetching transcript. Please try again.')
    }
  }
  useEffect(() => {
    handleBotFirstMessage()
  }, [])
  return (
    <>
      <div className="flex flex-row justify-center  md:flex-row md:justify-between">
        <div className="w-full min-h-screen">
          <TwoColumnLayout
            leftChildren={
              <>
                <iframe></iframe>
              </>
            }
            rightChildren={
              <>
                <ResultWithSources messages={messages} pngFile="tt-bot" maxMsgs={3} />

                <PromptBox
                  prompt={topic}
                  handlePromptChange={handleTopicChange}
                  handleSubmit={handleSubmit}
                  error={error}
                  placeHolderText={'Enter a topic'}
                  disableButton={true}
                  labelText="Topic"
                />
                <PromptBox
                  prompt={prompt}
                  handlePromptChange={handlePromptChange}
                  handleSubmit={handleSubmit}
                  placeHolderText={
                    messages.length === 1
                      ? 'Enter a youtube url, e.g., https://www.youtube.com/watch?v=O_9JoimRj8w'
                      : 'Ask a follow up question'
                  }
                  error={error}
                  labelText=""
                />
              </>
            }
          />
        </div>
      </div>
    </>
  )
}

export default ContentGenerator

