import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import {
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material'

import {
  Image,
  Item as ItemType,
  LocalItem as LocalItemType,
} from '../../app/types'

type ItemImageListProps = {
  item: ItemType | LocalItemType
  onClickImage: (image: Image) => void
  onDeleteImage: (image: Image) => void
  isEditing: boolean
  deletedImages: Set<Image>
}

const ItemImageList = ({
  item,
  onClickImage,
  onDeleteImage,
  isEditing,
  deletedImages,
}: ItemImageListProps) => {
  return (
    <ImageList
      cols={3}
      rowHeight={120}
      gap={5}
      sx={{ padding: '0 4px', margin: '5px 0' }}
    >
      {item.images!.map((img) => (
        <a
          key={img.id}
          href={img.data}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.preventDefault()}
        >
          <ImageListItem key={img.id}>
            <img
              key={img.id}
              src={img.thumbnail}
              alt={'img'}
              onClick={() => onClickImage(img)}
              style={{
                opacity: isEditing && deletedImages.has(img) ? 0.2 : 1,
              }}
            />
            <ImageOptions
              isEditing={isEditing}
              onDelete={() => onDeleteImage(img)}
            />
          </ImageListItem>
        </a>
      ))}
    </ImageList>
  )
}

type ImageOptionsProps = {
  isEditing?: boolean
  onDelete: () => void
}

export const ImageOptions = ({
  isEditing = true,
  onDelete,
}: ImageOptionsProps) => {
  return isEditing ? (
    <ImageListItemBar
      sx={{
        background:
          'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
          'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
      }}
      position="top"
      actionIcon={
        <IconButton
          sx={{ color: 'white' }}
          aria-label={'Delete'}
          onClick={onDelete}
        >
          <DeleteForeverRoundedIcon />
        </IconButton>
      }
      actionPosition="left"
    />
  ) : null
}

export default ItemImageList
