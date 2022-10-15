import { useEffect, useRef, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { fetchItems } from '../reducers/itemsSlice'

export default function LoadMore() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.items.items)
  const user = useAppSelector((state) => state.user)
  const hasMore = user ? items.length < user.total_items : false
  const refMore = useRef(null)
  const inViewport = useIntersection(refMore, '0px')

  useEffect(() => {
    if (inViewport && hasMore) {
      handleLoadMore()
    }
  }, [inViewport])

  const handleLoadMore = () => {
    try {
      const payload = { token: user!.token, offset: items.length }
      dispatch(fetchItems(payload))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div ref={refMore} style={{ padding: '1em' }}>
      {hasMore ? (
        <button
          type="button"
          onClick={handleLoadMore}
          style={{ display: 'none' }}
        ></button>
      ) : (
        <div>No more items</div>
      )}
    </div>
  )
}

const useIntersection = (element: any, rootMargin: any) => {
  const [isVisible, setState] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting)
      },
      { rootMargin }
    )

    element.current && observer.observe(element.current)

    return () => observer.disconnect()
  }, [])

  return isVisible
}
