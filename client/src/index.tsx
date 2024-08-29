import React from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import 'bulma/css/bulma.min.css'
import './assets/scss/main.scss'
import 'react-datepicker/dist/react-datepicker.css'
import { LanguageProvider } from './contexts/LanguageContext'

// import dotenv from "dotenv";

// dotenv.config();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
)
