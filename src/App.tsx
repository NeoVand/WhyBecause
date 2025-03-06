import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { docFlowKit } from './doc-flow-kit'

function App() {
  const [count, setCount] = useState(0)
  const [dbStatus, setDbStatus] = useState<string>('Initializing...')
  const [loadedDoc, setLoadedDoc] = useState<string>('None')

  useEffect(() => {
    async function testDB() {
      try {
        // Initialize the database
        setDbStatus('Initializing IndexedDB...')
        await docFlowKit.initialize()
        setDbStatus('IndexedDB initialized')
        
        // Create a test document
        const testDoc = {
          docId: 'test-doc',
          docType: 'Test',
          title: 'My Test Document',
          content: { hello: 'world' },
        }
        
        await docFlowKit.createDocument(testDoc)
        setDbStatus('Test document created')
        
        // Retrieve the document
        const loaded = await docFlowKit.getDocument('test-doc')
        console.log('Loaded doc from IDB:', loaded)
        
        if (loaded) {
          setLoadedDoc(JSON.stringify(loaded, null, 2))
        }
      } catch (error) {
        console.error('Error testing IndexedDB:', error)
        setDbStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    
    testDB()
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WhyBecause Analysis App</h1>
      
      <div className="card">
        <h2>IndexedDB Test</h2>
        <p>Status: {dbStatus}</p>
        <h3>Loaded Document:</h3>
        <pre style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          {loadedDoc}
        </pre>
      </div>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
