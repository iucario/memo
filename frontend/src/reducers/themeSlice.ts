import { createSlice } from '@reduxjs/toolkit'
import { getWindowColor } from '../utils/utils'

const initialState =
    localStorage.getItem('theme') || getWindowColor() || 'light'

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state: string) => {
            return state === 'light' ? 'dark' : 'light'
        },
    },
})

export default themeSlice.reducer

export const { toggleTheme } = themeSlice.actions
