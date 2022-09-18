import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import { useAppSelector } from '../app/hooks'
import { LoginResponse } from '../app/types'
import { login as loginApi, register } from '../utils/api'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

export default function LoginForm() {
  const user = useAppSelector((state) => state.user)

  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const validatePassword = (password: string) => {
    const symbols = new RegExp('^.*[#?!@$%^&*-]+.*$')
    const digits = new RegExp('^.*[0-9]+.*$')
    const lowercase = new RegExp('^.*[a-z]+.*$')
    const uppercase = new RegExp('^.*[A-Z]+.*$')

    if (password.length < 12) {
      return 'Password must be at least 12 characters long'
    } else if (password.length > 80) {
      return 'Password must be less than 80 characters long'
    } else if (!symbols.test(password)) {
      return 'Password must contain at least one symbol from #?!@$%^&*-'
    } else if (!digits.test(password)) {
      return 'Password must contain at least one digit'
    } else if (!lowercase.test(password)) {
      return 'Password must contain at least one lowercase letter'
    } else if (!uppercase.test(password)) {
      return 'Password must contain at least one uppercase letter'
    } else {
      return ''
    }
  }

  const handleRegister = (e: any) => {
    e.preventDefault()
    const validMsg = validatePassword(password)
    if (validMsg.length) {
      setMessage(validMsg)
      return
    }

    register(username, password)
      .then(() => {
        setUsername(username)
        setPassword(password)
        handleLogin(e)
      })
      .catch((err) => {
        console.error('register failed:', err.message)
        setMessage('Register failed. Username already exists.')
      })
  }

  const handleLogin = (e: any) => {
    e.preventDefault()
    if (username && password) {
      loginApi(username, password)
        .then((data: LoginResponse) => {
          localStorage.setItem('access_token', data.access_token)
          window.location.href = '/'
        })
        .catch((err) => {
          console.error('login failed:', err.message)
          setMessage('Login failed. Incorrect username or password.')
        })
    }
  }

  const handleUsernameChange = (e: any) => {
    setUsername(e.target.value)
  }

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value)
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      handleLogin(e)
    }
  }

  const handleClose = () => {
    setMessage('')
  }

  return (
    <Paper
      variant="outlined"
      square
      sx={{
        maxWidth: '400px',
        margin: 'auto',
      }}
    >
      <Box
        flexDirection="column"
        justifyContent="space-evenly"
        display="flex"
        alignItems="center"
        sx={{ margin: '1em auto' }}
      >
        <Link to="/" style={{ textDecoration: 'underline' }}>
          Home
        </Link>
        <Box component="form" sx={{ width: '100%', textAlign: 'left' }}>
          <p>Username</p>
          <input
            type="text"
            placeholder="username"
            autoComplete="username"
            onChange={handleUsernameChange}
          ></input>
          <p>Password</p>
          <input
            type="password"
            placeholder="password"
            required
            autoComplete="current-password"
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDown}
          ></input>
        </Box>
        <hr style={{ width: '100%', border: '1px solid' }} />
        <Box
          flexDirection="column"
          justifyContent="space-around"
          display="flex"
          alignItems="center"
          sx={{ width: '100%', margin: '0 auto' }}
        >
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
          <Button variant="contained" onClick={handleRegister}>
            Register
          </Button>
        </Box>
      </Box>
      {message && (
        <Alert variant="outlined" severity="error" onClose={handleClose}>
          {message}
        </Alert>
      )}
    </Paper>
  )
}
