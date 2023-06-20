import { remark } from 'remark'
import html from 'remark-html'
import externalLinks from 'remark-external-links'

export default async function returnAsMarkdown(str) {
  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(externalLinks).use(html).process(str)
  const contentHtml = processedContent.toString()
  return contentHtml
}

