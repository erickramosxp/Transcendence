import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './app/providers/AuthProvider.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './app/App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import '@/i18n'

const clientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;

const toastContainerProps = {
  position: 'bottom-right',
  draggable: true,
  newestOnTop: true,
  limit: 3,
  theme: 'dark',
  toastClassName: '!bg-transparent !shadow-none',
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
        { clientId ?
          (
            <GoogleOAuthProvider clientId={clientId}>
              <AuthProvider>
                <App />
                <ToastContainer {...toastContainerProps} />
              </AuthProvider>
            </GoogleOAuthProvider>
          )
          :
          (
            <AuthProvider>
              <App />
              <ToastContainer {...toastContainerProps} />
            </AuthProvider>
          )
        }
      </BrowserRouter>
    </StrictMode>,
)
