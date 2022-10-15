import { useState } from 'react'

import { Image, Item as ItemType } from '../../app/types'
import { delItem, postEdit } from '../../utils/api'
import parseMarkdown from '../../utils/parser'
import { dateToString, selectText } from '../../utils/utils'
import Editor from '../Editor/Editor'
import ItemImageList from './ItemImageList'
import BasicMenu from './Menu'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { deleteItem, editItem } from '../../reducers/itemsSlice'

type ItemProps = {
  item: ItemType
  onClickImage: (image: Image) => void
}

const Item = ({ item, onClickImage }: ItemProps) => {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.user?.token)

  const [isEditing, setIsEditing] = useState(false)
  const [deletedImages, setDeletedImages] = useState<Set<Image>>(new Set())

  const handleEdit = async (
    id: number,
    text: string,
    deleteImages: Image[],
    newImages: File[]
  ) => {
    setIsEditing(true)
    console.log('Edit', id, text, deleteImages, newImages)
    try {
      const resp = await postEdit(token!, id, text, deleteImages, newImages)
      dispatch(editItem(resp))
    } catch (err) {
      console.error('Edit failed', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (token) {
      try {
        await delItem(token, id)
        dispatch(deleteItem(id))
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleSave = async (text: string, images: File[]) => {
    if (token) {
      try {
        const deleteImgArr = Array.from(deletedImages)
        handleEdit(item.id, text, deleteImgArr, images)
      } catch (err) {
        console.error(err)
      }
    }
    handleExit()
  }

  const handleExit = () => {
    setIsEditing(false)
    setDeletedImages(new Set())
  }

  const handleDeleteImage = (image: Image) => {
    setDeletedImages(new Set(deletedImages).add(image))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'e' && !isEditing) {
      e.preventDefault()
      setIsEditing(true)
    }
  }

  const options = [
    {
      label: 'Copy',
      action: () => navigator.clipboard.writeText(item.text),
    },
    {
      label: 'Edit',
      action: () => setIsEditing(true),
    },
    {
      label: 'Delete',
      action: () => handleDelete(item.id),
    },
  ]

  return (
    <div className="item" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="item-option">
        <div className="date">{dateToString(item.created_time)}</div>
        <BasicMenu options={options} />
      </div>
      <div>
        {isEditing ? (
          <Editor
            initValue={item.text}
            onSave={handleSave}
            onExit={handleExit}
            cancelButton={true}
          ></Editor>
        ) : (
          <div
            className="item-text"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(item.text) }}
          ></div>
        )}
      </div>
      <ItemImageList
        item={item}
        onClickImage={onClickImage}
        onDeleteImage={handleDeleteImage}
        isEditing={isEditing}
        deletedImages={deletedImages}
      />
    </div>
  )
}

export default Item
