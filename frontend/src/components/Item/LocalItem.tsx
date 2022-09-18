import { useState } from 'react'

import { Image, LocalItem as LocalItemType } from '../../app/types'
import parseMarkdown from '../../utils/parser'
import { dateToString, saveLocalImages } from '../../utils/utils'
import Editor from '../Editor/Editor'
import ItemImageList from './ItemImageList'
import BasicMenu from './Menu'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  deleteLocalItem,
  editLocalItem,
  syncItem,
} from '../../reducers/itemsSlice'
import { updateUser } from '../../reducers/userSlice'

import Chip from '@mui/material/Chip'

type ItemProps = {
  item: LocalItemType
  onClickImage: (image: Image) => void
}

const LocalItem = ({ item: localItem, onClickImage }: ItemProps) => {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.user?.token)
  const items = useAppSelector((state) => state.items.localItems)
  const [isEditing, setIsEditing] = useState(false)
  const [deletedImages, setDeletedImages] = useState<Set<Image>>(new Set())

  const handleEdit = async (
    id: number,
    text: string,
    deletedImages: Image[],
    newImages: File[]
  ) => {
    setIsEditing(true)
    const images = await saveLocalImages(newImages, id)
    deletedImages.forEach((img) => {
      localStorage.removeItem(img.name)
    })
    dispatch(editLocalItem({ id, text, newImages: images, deletedImages }))
  }

  const handleDelete = async (id: number) => {
    const item = items.find((item) => item.id === id)
    if (item) {
      item.images.forEach((image) => {
        localStorage.removeItem(image.name)
      })
    }
    dispatch(deleteLocalItem(id))
  }

  const handleSave = async (text: string, images: File[]) => {
    const deleteImgArr = Array.from(deletedImages)
    handleEdit(localItem.id, text, deleteImgArr, images)
    handleExit()
  }

  const handleExit = () => {
    setIsEditing(false)
    setDeletedImages(new Set())
  }

  const handleDeleteImage = (image: Image) => {
    setDeletedImages(new Set(deletedImages).add(image))
  }

  const sync = () => {
    if (token) {
      dispatch(syncItem({ localItem, token }))
      dispatch(updateUser({ token }))
    } else {
      console.warn('Login first')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'e' && !isEditing) {
      e.preventDefault()
      setIsEditing(true)
    }
  }

  const options = [
    {
      label: 'Sync',
      action: sync,
    },
    {
      label: 'Edit',
      action: () => setIsEditing(true),
    },
    {
      label: 'Delete',
      action: () => handleDelete(localItem.id),
    },
  ]

  return (
    <div className="item" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="item-option">
        <div className="date">{dateToString(localItem.created_time)}</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'right',
          }}
        >
          <Chip
            variant="outlined"
            size="small"
            color="info"
            label="local"
            sx={{ margin: 'auto' }}
          />
          <BasicMenu options={options} />
        </div>
      </div>
      <div>
        {isEditing ? (
          <Editor
            initValue={localItem.text}
            onSave={handleSave}
            onExit={handleExit}
            cancelButton={true}
          ></Editor>
        ) : (
          <div
            className="item-text"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(localItem.text) }}
          ></div>
        )}
      </div>
      <ItemImageList
        item={localItem}
        onClickImage={onClickImage}
        onDeleteImage={handleDeleteImage}
        isEditing={isEditing}
        deletedImages={deletedImages}
      />
    </div>
  )
}

export default LocalItem
