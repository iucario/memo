import { useState } from 'react'

import CodeIcon from '@mui/icons-material/Code'
import DataObjectIcon from '@mui/icons-material/DataObject'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import LinkIcon from '@mui/icons-material/Link'
import SendIcon from '@mui/icons-material/Send'
import LoadingButton from '@mui/lab/LoadingButton'
import { Box, Grid, IconButton } from '@mui/material'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Tooltip from '@mui/material/Tooltip'

import { useAppSelector } from '../../app/hooks'
import { insertText } from '../../utils/utils'
import { ImageOptions } from '../Item/ItemImageList'
import InputArea from './Input'
import UploadImage from './UploadImage'

type Data = {
  text: string
  imageFiles: File[]
}

type EditorProps = {
  initValue?: string
  onSave: (text: string, files: File[]) => void
  onExit?: () => void
  cancelButton?: boolean
}

const Editor = ({
  initValue = '',
  onSave,
  onExit,
  cancelButton = false,
}: EditorProps) => {
  const status = useAppSelector((state) => state.items.status)
  const [data, setData] = useState<Data>({ text: initValue, imageFiles: [] })
  const [key, setKey] = useState(new Date().getTime())

  const id = String(Math.round(Math.random() * 1e8))

  const handleChange = (e: any) => {
    data.text = e.target.value
  }

  const handleSave = () => {
    onSave(data.text, data.imageFiles)
    // data.imageFiles.forEach((imgFile) => URL.revokeObjectURL(imgFile.name))
    setData({ text: '', imageFiles: [] })
    setKey(new Date().getTime())
  }

  const handleUploadImages = (files: File[]) => {
    setData({ text: data.text, imageFiles: [...data.imageFiles, ...files] })
  }

  const handleDeleteImage = (index: number) => {
    setData({
      text: data.text,
      imageFiles: data.imageFiles.filter((img, i) => i !== index),
    })
  }

  /** Paste image in input and append to data.imageFiles*/
  const handlePaste = async (e: any) => {
    let files = e.clipboardData.files
    files = Array.from(files) as File[]
    files = files.filter(
      (file: File) => file.type === 'image/png' || file.type === 'image/jpeg'
    )
    setData({ text: data.text, imageFiles: [...data.imageFiles, ...files] })
  }

  const handleFormat = (format: string) => {
    const input = document.getElementById(id) as HTMLTextAreaElement
    input.focus()
    if (format === 'bold') {
      insertText(input, '**')
    } else if (format === 'italic') {
      insertText(input, '*')
    } else if (format === 'code') {
      insertText(input, '`')
    } else if (format === 'link') {
      input.setRangeText(
        '[]()',
        input.selectionStart,
        input.selectionStart,
        'start'
      )
    } else if (format === 'codeblock') {
      insertText(input, '```')
    }
  }

  return (
    <div>
      <InputArea
        key={key}
        id={id}
        initValue={initValue}
        onSave={handleSave}
        onChange={handleChange}
        onExit={onExit}
        onPaste={handlePaste}
      />
      <Grid container spacing={0} justifyContent={'space-between'}>
        <Grid container item xs={8} sm={8} textAlign="left">
          <Box>
            <UploadImage key={key} addImageFiles={handleUploadImages} />
            <Tooltip title="Bold Ctrl/&#8984;+B">
              <IconButton color="primary" onClick={() => handleFormat('bold')}>
                <FormatBoldIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic Ctrl/&#8984;+I">
              <IconButton
                color="primary"
                onClick={() => handleFormat('italic')}
              >
                <FormatItalicIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Code Ctrl/&#8984;+J">
              <IconButton color="primary" onClick={() => handleFormat('code')}>
                <CodeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Codeblock Ctrl/&#8984;+M">
              <IconButton
                color="primary"
                onClick={() => handleFormat('codeblock')}
              >
                <DataObjectIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Link Ctrl/&#8984;+L">
              <IconButton color="primary" onClick={() => handleFormat('link')}>
                <LinkIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <ImageList cols={1}>
            {data.imageFiles.map((img, index) => (
              <ImageListItem key={index}>
                <img
                  key={img.name}
                  src={URL.createObjectURL(img)}
                  alt={img.name}
                />
                <ImageOptions onDelete={() => handleDeleteImage(index)} />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>
        <Grid
          container
          item
          xs={4}
          sm={4}
          textAlign="right"
          justifyContent="flex-end"
        >
          <ButtonGroup
            orientation="vertical"
            aria-label="vertical outlined button group"
          >
            {cancelButton && (
              <Tooltip title="ESC">
                <Button variant="outlined" color="secondary" onClick={onExit}>
                  Cancel
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Ctrl/&#8984;+Enter">
              {status === 'pending' ? (
                <LoadingButton
                  loading
                  loadingPosition="start"
                  startIcon={<SendIcon />}
                  variant="outlined"
                >
                  Pending
                </LoadingButton>
              ) : (
                <Button
                  variant="outlined"
                  endIcon={<SendIcon />}
                  onClick={handleSave}
                >
                  Send
                </Button>
              )}
            </Tooltip>
          </ButtonGroup>
        </Grid>
      </Grid>
    </div>
  )
}

export default Editor
