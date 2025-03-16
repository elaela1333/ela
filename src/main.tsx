// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools"
TempoDevtools.init();

// Before you render your app
ReactDOM.render(<App />, document.getElementById("root"));
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
