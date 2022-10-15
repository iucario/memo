import { useState } from 'react'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RestoreIcon from '@mui/icons-material/Restore'
import SyncIcon from '@mui/icons-material/Sync'
import { IconButton, Menu, MenuItem } from '@mui/material'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { styled } from '@mui/material/styles'
const StyledMenu = styled((props: any) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 3,
    marginTop: theme.spacing(1),
    minWidth: 50,
    backgroundColor:
      theme.palette.mode === 'light'
        ? theme.palette.grey[100]
        : theme.palette.grey[800],
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    '& .MuiMenu-list': {
      padding: '0px 0px',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
    },
  },
}))

type BasicMenuProps = {
  options: { label: string; action: () => void }[]
}

export default function BasicMenu({ options }: BasicMenuProps) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const iconMap = new Map([
    ['edit', <EditIcon />],
    ['delete', <DeleteIcon />],
    ['sync', <SyncIcon />],
    ['restore', <RestoreIcon />],
    ['copy', <ContentCopyIcon />],
  ])

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        disableTouchRipple
        focusRipple
        color="inherit"
      >
        <MoreHorizIcon sx={{ color: '#757575d2' }} />
      </IconButton>
      <StyledMenu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        aria-labelledby="basic-demo-button"
      >
        {options.map((option) => {
          return (
            <MenuItem
              key={option.label}
              sx={{ border: '1px solid #e0e0e0' }}
              onClick={() => {
                handleClose()
                option.action()
              }}
            >
              <ListItemIcon>
                {iconMap.get(option.label.toLowerCase()) || <MoreHorizIcon />}
              </ListItemIcon>
              <ListItemText primary={option.label} />
            </MenuItem>
          )
        })}
      </StyledMenu>
    </div>
  )
}
