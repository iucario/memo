import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

import { createTheme, ThemeProvider } from '@mui/material/styles'

import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Editor from './components/Editor/Editor'
import HelpDialog from './components/HelpDialog'
import List from './components/List'
import LoadMore from './components/LoadMore'
import Navbar from './components/Navbar/AppBar'

import { getMe } from './utils/api'

import { useAppDispatch, useAppSelector } from './app/hooks'
import { Image, LocalItem as LocalItemType } from './app/types'
import FloatingBtn from './components/FloatingBtn'
import LoginForm from './components/LoginForm'
import RecycleBin from './components/RecycleBin'
import { addLocalItem, fetchItems, syncItem } from './reducers/itemsSlice'
import { login, updateUser } from './reducers/userSlice'
import { saveLocalImages } from './utils/utils'
import FloatingEditor from './components/Editor/FloatingEditor'

export default function App() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)
  const token = localStorage.getItem('access_token')
  const colorMode = useAppSelector((state) => state.theme) as 'light' | 'dark'
  const [openHelp, setOpenHelp] = useState(false)
  const [openEditor, setOpenEditor] = useState(false)

  useEffect(() => {
    if (token) {
      getUser()
    }
    document.documentElement.setAttribute('data-theme', colorMode)
    // @ts-ignore
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      // @ts-ignore
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode,
        },
      }),
    [colorMode]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      document.getElementById('search')?.focus()
    } else if (e.key === '?') {
      e.preventDefault()
      setOpenHelp(true)
    }
  }, [])

  const getUser = async () => {
    try {
      let data = await getMe(token!)
      data.token = token
      dispatch(login(data))
      dispatch(fetchItems({ token: data.token, offset: 0 }))
      dispatch(updateUser({ token: data.token }))
    } catch (err) {
      dispatch(login(null))
      localStorage.removeItem('access_token')
    }
  }

  const saveLocalItem = async (text: string, files: File[]) => {
    const timenow = new Date().getTime()
    const images = await saveLocalImages(files, timenow)

    const newItem = {
      id: timenow,
      text,
      images: images.map((x) => x.name),
      created_time: timenow,
    }

    if (localStorage.getItem('temp')) {
      const temp = JSON.parse(localStorage.getItem('temp')!)
      temp.unshift(newItem)
      localStorage.setItem('temp', JSON.stringify(temp))
    } else {
      localStorage.setItem('temp', JSON.stringify([newItem]))
    }
    const localItem: LocalItemType = {
      ...newItem,
      images: images as Image[],
    }
    return localItem
  }

  const handleEditorSave = async (text: string, images: File[]) => {
    // Add to local items first
    const newLocalItem = await saveLocalItem(text, images)
    dispatch(addLocalItem(newLocalItem))
    if (user) {
      dispatch(syncItem({ token: user.token, localItem: newLocalItem }))
      dispatch(updateUser({ token: user.token }))
    }
    setOpenEditor(false)
  }

  const main = (
    <Navbar
      content={
        <>
          <List />
          <LoadMore />
          <FloatingBtn onClick={() => setOpenEditor(true)} />
          <FloatingEditor
            content={<Editor onSave={handleEditorSave} />}
            open={openEditor}
            onClose={() => setOpenEditor(false)}
          />
        </>
      }
    />
  )

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="Background">
        <div className="App" id="app">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={main} />
              <Route path="/login" element={<LoginForm />} />
              <Route
                path="/recycle"
                element={<Navbar content={<RecycleBin />} />}
              />
            </Routes>
          </BrowserRouter>
          <HelpDialog
            open={openHelp}
            onClose={() => {
              setOpenHelp(false)
            }}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}
