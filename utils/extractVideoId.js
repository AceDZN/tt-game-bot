export default function extractVideoId(url) {
  // do stuff
  const urlParams = new URLSearchParams(new URL(url).search)
  return urlParams.get('v')
}

