import SearchIcon from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import { useAppDispatch } from '../../app/hooks'
import { filterItems } from '../../reducers/itemsSlice'

const Search = () => {
  const dispatch = useAppDispatch()

  const handleChange = (e: any) => {
    dispatch(filterItems(e.target.value))
  }

  return (
    <>
      <InputBase
        onChange={handleChange}
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search Ctrl/Cmd+K"
        inputProps={{ 'aria-label': 'search' }}
        id="search"
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </>
  )
}

export default Search
