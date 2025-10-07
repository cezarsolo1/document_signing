export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Webhook Handler API</h1>
      <p>This is an edge function for processing BoldSign webhook requests.</p>
      
      <h2>Endpoint</h2>
      <code style={{ background: '#f4f4f4', padding: '0.5rem', display: 'block', marginTop: '0.5rem' }}>
        POST /api/webhook-handler
      </code>
      
      <h2>Status</h2>
      <p>✅ API is running</p>
      
      <h2>Documentation</h2>
      <p>See README.md for usage instructions and payload format.</p>
    </main>
  )
}
