import { configureStore } from '@reduxjs/toolkit'
import itemsReducer from '../reducers/itemsSlice'
import userReducer from '../reducers/userSlice'
import themeReducer from '../reducers/themeSlice'

export const store = configureStore({
    reducer: {
        items: itemsReducer,
        user: userReducer,
        theme: themeReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
