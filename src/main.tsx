import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProjectProvider } from './doc-flow-kit'
import { UserProvider } from './doc-flow-kit/UserContext'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { useUser } from './doc-flow-kit/UserContext'
import { lightTheme, darkTheme } from './theme'

// Wrap the App with theme provider based on user preferences
const ThemedApp = () => {
  const { isDarkMode } = useUser();
  
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <ProjectProvider>
        <ThemedApp />
      </ProjectProvider>
    </UserProvider>
  </StrictMode>,
)
