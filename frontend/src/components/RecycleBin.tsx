import { useEffect, useState } from 'react'

import { useAppSelector } from '../app/hooks'
import { Item as ItemType } from '../app/types'
import { getRecycleBin, restoreItem } from '../utils/api'
import RecycleItem from './Item/RecycleItem'

export default function RecycleBin() {
  const user = useAppSelector((state) => state.user)
  const [recycleBin, setRecycleBin] = useState<ItemType[]>([])

  useEffect(() => {
    if (user) {
      getRecycleBin(user.token).then((data) => {
        setRecycleBin(data)
      })
    }
  }, [])

  const handleRestore = async (id: number) => {
    try {
      await restoreItem(user!.token, id)
      const index = recycleBin.findIndex((item) => item.id === id)
      setRecycleBin([
        ...recycleBin.slice(0, index),
        ...recycleBin.slice(index + 1),
      ])
    } catch (err) {
      console.error('Restore failed', err)
    }
  }

  return (
    <div className="item-list">
      {recycleBin.map((item) => (
        <RecycleItem
          key={item.id}
          item={item}
          onClickImage={(img) => {}}
          options={[
            {
              label: 'Restore',
              action: () => handleRestore(item.id),
            },
          ]}
        />
      ))}
    </div>
  )
}
