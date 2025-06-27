const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 54321

// Mock data
let subscriptions = [
  {
    id: '1',
    name: 'Netflix',
    price: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-01',
    category: 'Entertainment',
    userId: 'demo-user'
  }
]

let users = [
  {
    id: 'demo-user',
    email: 'demo@subtrack.dev',
    plan: 'free',
    teamId: 'demo-team'
  }
]

let teams = [
  {
    id: 'demo-team',
    name: 'Demo Team',
    currentMembers: 1,
    maxSeats: 3
  }
]

app.use(cors())
app.use(express.json())

// Auth endpoints
app.post('/auth/v1/token', (req, res) => {
  const { email, password } = req.body
  if (email === 'demo@subtrack.dev' && password === 'demo123') {
    res.json({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: users[0]
    })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

app.get('/auth/v1/user', (req, res) => {
  res.json(users[0])
})

// Subscriptions endpoints
app.get('/rest/v1/subscriptions', (req, res) => {
  res.json(subscriptions)
})

app.post('/rest/v1/subscriptions', (req, res) => {
  const newSub = {
    id: Date.now().toString(),
    ...req.body,
    userId: 'demo-user'
  }
  subscriptions.push(newSub)
  res.json(newSub)
})

app.put('/rest/v1/subscriptions/:id', (req, res) => {
  const { id } = req.params
  const index = subscriptions.findIndex(s => s.id === id)
  if (index !== -1) {
    subscriptions[index] = { ...subscriptions[index], ...req.body }
    res.json(subscriptions[index])
  } else {
    res.status(404).json({ error: 'Not found' })
  }
})

app.delete('/rest/v1/subscriptions/:id', (req, res) => {
  const { id } = req.params
  const index = subscriptions.findIndex(s => s.id === id)
  if (index !== -1) {
    subscriptions.splice(index, 1)
    res.json({ success: true })
  } else {
    res.status(404).json({ error: 'Not found' })
  }
})

// Teams endpoints
app.get('/rest/v1/teams', (req, res) => {
  res.json(teams)
})

// Analytics endpoints
app.get('/rest/v1/rpc/category_analytics', (req, res) => {
  res.json([
    { category: 'Entertainment', total: 15.99, count: 1 },
    { category: 'General', total: 0, count: 0 }
  ])
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`)
  console.log('Available endpoints:')
  console.log('- POST /auth/v1/token (login)')
  console.log('- GET /auth/v1/user (user info)')
  console.log('- GET /rest/v1/subscriptions (list subscriptions)')
  console.log('- POST /rest/v1/subscriptions (create subscription)')
  console.log('- PUT /rest/v1/subscriptions/:id (update subscription)')
  console.log('- DELETE /rest/v1/subscriptions/:id (delete subscription)')
  console.log('- GET /rest/v1/teams (list teams)')
  console.log('- GET /rest/v1/rpc/category_analytics (analytics)')
}) 