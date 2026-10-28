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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <StoreProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </StoreProvider>
    </UserProvider>
  </StrictMode>,
)
