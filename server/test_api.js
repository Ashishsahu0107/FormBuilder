async function main() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ashish@example.com', password: 'password' }) // replace with real user if known
    })
    const loginData = await loginRes.json()
    console.log('Login:', loginData)
  } catch(e) { console.error(e) }
}
main()
