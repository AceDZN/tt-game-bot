import React from 'react'
import { sourceCodePro } from './styles/fonts'

const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer
      className={`p-4 bg-gray-800 text-white w-full flex align-middle justify-center  ${sourceCodePro.className}`}
    >
      <p className={`text-center ${sourceCodePro.className}`}>&copy; AceDZN {year}</p>
    </footer>
  )
}

export default Footer

