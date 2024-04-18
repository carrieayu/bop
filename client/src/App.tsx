import React from 'react'
import { useRoutes } from 'react-router-dom'
import routes from './routes'
import './assets/scss/main.scss'

function App() {
  const content = useRoutes(routes)

  return <div className='App'>{content}</div>
}

export default App
