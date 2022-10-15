import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'

const fabStyle = {
  position: 'fixed',
  bottom: 16,
  right: 16,
}

export default function FloatingActionButtons({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <Box sx={{ '& > :not(style)': { m: 1 } }}>
      <Fab color="primary" aria-label="add" sx={fabStyle} onClick={onClick}>
        <AddIcon />
      </Fab>
    </Box>
  )
}
