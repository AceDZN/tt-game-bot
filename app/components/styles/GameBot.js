import styled from 'styled-components'

export const ResultContainer = styled.div`
  h1 {
    font-size: 1.5em;
  }
  h2 {
    font-size: 1.25em;
  }
  h3 {
    font-size: 1.15em;
  }
  h4 {
    font-size: 1em;
  }
  h5 {
    font-size: 0.83em;
  }
  h6 {
    font-size: 0.67em;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    background: #f8f8f8;
    border-top: 1px solid #ebebeb;
    border-bottom: 1px solid #ebebeb;
    font-weight: normal;
    padding-left: 2px;
    padding-right: 2px;
    padding-top: 3px;
    padding-bottom: 3px;
  }
  blockquote {
    background: #e6f2e6;
    border-left: 3px solid #408040;
    font-style: italic;
    padding-left: 5px;
    margin-left: 2px;
  }
  pre {
    background: #e0f0ff;
    border-left: 5px solid #55aaff;
    padding: 5px;
    margin-left: 2px;
  }
  code {
    background: #e0f0ff;
    font-family: JetBrains Mono NL, Courier New, Monospaced;
    font-size: 0.9em;
  }
  table {
    border-spacing: 0px;
    border-right: 1px solid gray;
    border-bottom: 1px solid gray;
  }
  th,
  td {
    border-left: 1px solid gray;
    border-top: 1px solid gray;
  }
  th {
    background: #d4d4d4;
    font-weight: 600;
  }
  ul {
    margin-left-ltr: 20px;
    margin-right-rtl: 20px;
  }
  ol {
    margin-left-ltr: 25px;
    margin-right-rtl: 25px;
  }
  a {
    font-weight: 600;
    color: #006dd3;
    cursor: pointer;
    display: inline-block;
    &:hover {
      text-decoration: underline;
      text-shadow: 0 0 1px #7bb7f0;
      cursor: pointer;
    }
  }
`

