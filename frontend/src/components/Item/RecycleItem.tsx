import { Image, Item as ItemType } from '../../app/types'
import parseMarkdown from '../../utils/parser'
import { dateToString } from '../../utils/utils'
import ItemImageList from './ItemImageList'
import BasicMenu from './Menu'

import Chip from '@mui/material/Chip'

type Option = {
  label: string
  action: () => void
}

type ItemProps = {
  item: ItemType
  onClickImage: (image: Image) => void
  options: Option[]
}

export default function RecycleItem({
  item,
  onClickImage,
  options,
}: ItemProps) {
  return (
    <div className="item" tabIndex={0}>
      <div className="item-option">
        <div className="date">{dateToString(item.created_time)}</div>
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
            label="recycle"
            sx={{ margin: 'auto' }}
          />
          <BasicMenu options={options} />
        </div>
      </div>
      <div>
        <div
          className="item-text"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(item.text) }}
        ></div>
      </div>
      <ItemImageList
        item={item}
        onClickImage={() => {}}
        onDeleteImage={() => {}}
        isEditing={false}
        deletedImages={new Set()}
      />
    </div>
  )
}
