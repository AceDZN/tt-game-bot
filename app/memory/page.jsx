'use client'
import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import PromptBox from '../components/PromptBox'
import Title from '../components/Title'
import TwoColumnLayout from '../components/TwoColumnLayout'
import ResultWithSources from '../components/ResultWithSources'
import '../globals.css'

const MemoryPage = () => {
  const [messages, setMessages] = useState([
    { text: 'Hi there! what is your name and what is your favorite food?', type: 'bot' },
  ])
  const [prompt, setPrompt] = useState('')
  const handlePromptSubmit = async () => {
    console.log('sending', prompt)
    setMessages((prevState) => {
      return [...prevState, { text: prompt, type: 'user', sourceDocuments: null }]
    })
    try {
      const msg = `${prompt}`
      setPrompt('')
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: msg }),
      })
      if (!response.ok) {
        throw new Error(`Something went wrong: ${response.status}`)
      }

      const messageResponse = await response.json()

      console.log(messageResponse, 'messageResponse')
      setMessages((prevState) => {
        return [...prevState, { text: messageResponse.output.response, type: 'bot', sourceDocuments: null }]
      })
      setError('')
    } catch (e) {
      console.error(e)
      setError(e)
    }
  }
  const handlePromptChange = async (e) => {
    setPrompt(e.target.value)
  }
  const [error, setError] = useState(null)

  return (
    <>
      <Title emoji={'👁️'} headingText={'MEMORY PAGE'} />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading={'My Memory is huge!'}
              boldText={'here goes some lorem ipsum. Lorem ipxum dolor sit amet. '}
              description={'other long text, just here for fun for now lorem ipsum delor sit amet!'}
            />
          </>
        }
        rightChildren={
          <>
            <ResultWithSources messages={messages} pngFile={'brain'} maxMsgs={1000} />
            <PromptBox
              prompt={prompt}
              handleSubmit={handlePromptSubmit}
              handlePromptChange={handlePromptChange}
              error={error}
            />
          </>
        }
      />
    </>
  )
}

export default MemoryPage

