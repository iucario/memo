import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { Image, Item as ItemType } from '../app/types'
import { fetchItems } from '../reducers/itemsSlice'
import { saveLocalItems } from '../utils/utils'
import Item from './Item/Item'
import LocalItem from './Item/LocalItem'

/** Display `items` if not being filtered. Else display filtered items. */
const List = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)
  const items = useAppSelector((state) => state.items.items)
  const localItems = useAppSelector((state) => state.items.localItems)
  const filteredItems = useAppSelector((state) => state.items.filteredItems)
  const [isOpen, setIsOpen] = useState(false)
  const [openImage, setOpenImage] = useState<Image | null>(null)
  const [displayItems, setDisplayItems] = useState<ItemType[]>(items)

  useEffect(() => {
    getItems()
  }, [])

  useEffect(() => {
    if (filteredItems !== null) {
      setDisplayItems(filteredItems)
    } else {
      setDisplayItems(items)
    }
  }, [filteredItems, items])

  useEffect(() => {
    saveLocalItems(localItems)
  }, [localItems])

  const getItems = async () => {
    const offset = items.length
    if (user) {
      dispatch(fetchItems({ token: user.token, offset }))
    }
  }

  const handleCloseModal = () => {
    setIsOpen(false)
  }

  const handleClickThumbnail = (img: Image) => {
    setIsOpen(true)
    setOpenImage(img)
  }

  return (
    <>
      <MyModal
        isOpen={isOpen}
        openImage={openImage}
        handleClose={handleCloseModal}
      />
      <div className="item-list">
        {localItems.map((item) => (
          <LocalItem
            key={item.id}
            item={item}
            onClickImage={handleClickThumbnail}
          />
        ))}
      </div>
      <div className="item-list">
        {displayItems.map((item) => (
          <Item key={item.id} item={item} onClickImage={handleClickThumbnail} />
        ))}
      </div>
    </>
  )
}

type MyModalProps = {
  isOpen: boolean
  openImage: Image | null
  handleClose: () => void
}

const MyModal = ({ isOpen, openImage, handleClose }: MyModalProps) => {
  return (
    <Dialog fullScreen open={isOpen} onClose={handleClose}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </Toolbar>
      {openImage && (
        <a href={openImage.data} target="_blank" rel="noreferrer">
          <img
            style={{
              width: '100%',
              margin: '0 auto',
            }}
            alt={'modal-img'}
            src={openImage.data}
          ></img>
        </a>
      )}
    </Dialog>
  )
}

export default List
