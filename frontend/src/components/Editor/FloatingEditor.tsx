import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

export default function FloatingEditor({
  content,
  open,
  onClose,
}: {
  content: JSX.Element
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="responsive-dialog-title"
      fullScreen
    >
      <DialogTitle id="responsive-dialog-title">{'Memo'}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ position: 'relative', right: '20px', bottom: '20px' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
