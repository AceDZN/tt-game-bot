'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { sourceCodePro } from './styles/fonts'
import HamburgerMenu from './components/HamburgerMenu'
const Navbar = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // const Navbar = () => {
  return (
    <nav className="fixed z-10 top-0 bg-gray-50 text-gray-800 w-full p-4 grid grid-cols-3 items-center">
      <Link href="/">Home 🏡 </Link>
      {/*<Link href="/video-chat">YouTube Video Chat 💬</Link>*/ ''}
      <Link href="/game-generator">TinyTap Game Wizard 🧙🏼</Link>
    </nav>
  )
}

export default Navbar

