import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { User } from '../app/types'
import { getMe } from '../utils/api'

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async (payload: { token: string }) => {
        let items = await getMe(payload.token)
        items.token = payload.token
        return items
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState: null as User | null,
    reducers: {
        login: (state: User | null, action: { payload: User | null }) => {
            return action.payload
        },
        logout: () => {
            localStorage.removeItem('access_token')
            window.location.reload()
            return null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(updateUser.fulfilled, (state, action) => {
            return action.payload
        })
    },
})

export default userSlice.reducer
export const { login, logout } = userSlice.actions
