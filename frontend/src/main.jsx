import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/fasco-reference.css'
import './styles/theme-overrides.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import App from './App'
import UserProvider from './context/UserContext';
import StoreProvider from './context/StoreContext';
import { ThemeProvider } from './components/ThemeProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

const app = (
  <StrictMode>
    <UserProvider>
      <StoreProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </StoreProvider>
    </UserProvider>
  </StrictMode>
)

createRoot(document.getElementById('root')).render(
  import.meta.env.VITE_GOOGLE_CLIENT_ID
    ? <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
    : app,
)
