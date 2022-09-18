import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

type UploadImageProps = {
  addImageFiles: (images: File[]) => void
}

const UploadImage = ({ addImageFiles }: UploadImageProps) => {
  const handleUpload = (e: any) => {
    const fileArray = Array.from(e.target.files) as File[]
    addImageFiles(fileArray)
  }
  const id = String(Math.round(Math.random() * 1e8))

  const handleLabelKeyDown = (e: any) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.target.click()
    }
  }

  return (
    <Tooltip title="Photo">
      <IconButton
        color="primary"
        component="label"
        onKeyDown={handleLabelKeyDown}
      >
        <input
          className="custom-file-upload"
          type="file"
          accept="image/png, image/jpeg"
          id={id}
          multiple
          onChange={handleUpload}
        />
        <AddPhotoAlternateOutlinedIcon />
      </IconButton>
    </Tooltip>
  )
}

export default UploadImage
