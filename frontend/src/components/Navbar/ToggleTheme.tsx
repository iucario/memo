import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import ListItem from '@mui/material/ListItem/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { toggleTheme } from '../../reducers/themeSlice'
import { getWindowColor } from '../../utils/utils'

const ToggleTheme = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme)

  const handleClick = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', newTheme)
    const systemTheme = getWindowColor()
    if (newTheme === systemTheme) {
      localStorage.removeItem('theme') // better UX
    } else {
      localStorage.setItem('theme', newTheme)
    }
    dispatch(toggleTheme())
  }

  return (
    <ListItem disablePadding onClick={handleClick}>
      <ListItemButton>
        <ListItemIcon>
          {theme === 'light' ? (
            <DarkModeRoundedIcon />
          ) : (
            <LightModeRoundedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={theme === 'light' ? 'To Dark' : 'To Light'} />
      </ListItemButton>
    </ListItem>
  )
}

export default ToggleTheme
