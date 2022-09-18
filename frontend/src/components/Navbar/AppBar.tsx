import { useState } from 'react'

import DownloadIcon from '@mui/icons-material/Download'
import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import RefreshIcon from '@mui/icons-material/Refresh'
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash'
import { Divider } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'

import { Link } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { logout } from '../../reducers/userSlice'
import { exportData } from '../../utils/api'
import Search from './Search'
import ToggleTheme from './ToggleTheme'

const DrawerContent = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleExport = async () => {
    if (user) {
      try {
        const blob = await exportData(user.token)
        var objectUrl = URL.createObjectURL(blob)
        window.open(objectUrl)
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div>
      <Toolbar />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <ToggleTheme />
        <ListItem disablePadding onClick={handleReload}>
          <ListItemButton>
            <ListItemIcon>
              <RefreshIcon />
            </ListItemIcon>
            <ListItemText primary="Reload" />
          </ListItemButton>
        </ListItem>
        <Link to="/">
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link to="/recycle">
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <RestoreFromTrashIcon />
              </ListItemIcon>
              <ListItemText primary="Recycle Bin" />
            </ListItemButton>
          </ListItem>
        </Link>
        <Divider />
        {user ? (
          <>
            <ListItem>
              <span>
                User name: <b>{user?.name}</b>
              </span>
            </ListItem>
            <ListItem>
              <span>
                Total items: <b>{user?.total_items}</b>
              </span>
            </ListItem>
            <ListItem disablePadding onClick={handleExport}>
              <ListItemButton>
                <ListItemIcon>
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText primary="Export" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding onClick={handleLogout}>
              <ListItemButton>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <Link to="/login">
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
            </Link>
          </>
        )}
      </Box>
    </div>
  )
}

export default function Navbar({ content }: { content: JSX.Element }) {
  const drawerWidth = 240

  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="default"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Search />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          <DrawerContent />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          <DrawerContent />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          width: {
            sm: `calc(100% - ${drawerWidth}px)`,
            xs: `calc(100% - 1em)`,
          },
        }}
      >
        <Toolbar /> {/*This is needed to push the content down*/}
        {content}
      </Box>
    </Box>
  )
}
