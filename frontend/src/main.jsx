import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './app/providers/AuthProvider.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './app/App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
        { clientId ?
          (
            <GoogleOAuthProvider clientId={clientId}>
              <AuthProvider>
                <App />
                <ToastContainer
                  position='bottom-right'
                  draggable
                />
              </AuthProvider>
            </GoogleOAuthProvider>
          )
          :
          (
            <AuthProvider>
              <App />
              <ToastContainer
                position='bottom-right'
                draggable
              />
            </AuthProvider>
          )
        }
      </BrowserRouter>
    </StrictMode>,
)
