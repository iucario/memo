import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

export default function HelpDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">{'Help'}</DialogTitle>
      <DialogContent>
        <p>Shortcuts:</p>
        <ul>
          <li>
            <code>Ctrl/Cmd K</code>: Focus on search bar
          </li>
          <li>
            <code>Ctrl/Cmd Enter</code>: Save note
          </li>
          <li>
            <code>E</code>: Edit focused item
          </li>
          <li>
            <code>?</code>: Open help dialog
          </li>
        </ul>
        <p>Tips:</p>
        <ul>
          <li>Paste image to editor to upload image.</li>
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
