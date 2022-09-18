import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Item, LocalItem, Image } from '../app/types'
import { loadItems, addItem as addItemApi } from '../utils/api'
import { dataUrlToBlob, loadLocalItems } from '../utils/utils'

export const fetchItems = createAsyncThunk(
    'items/fetchItems',
    async (payload: { token: string; offset: number }) => {
        const items = await loadItems(payload.token, payload.offset)
        return items
    }
)

export const addNewItem = createAsyncThunk(
    'items/addNewItem',
    async (payload: { token: string; text: string; images: File[] }) => {
        let item = (await addItemApi(
            payload.token,
            payload.text,
            payload.images
        )) as Item
        // hack for CloudFront url not showing immediately
        item.images!.forEach((img, i) => {
            img.thumbnail = URL.createObjectURL(payload.images[i])
        })
        return item
    }
)

export const syncItem = createAsyncThunk(
    'localItems/syncItem',
    async (payload: { localItem: LocalItem; token: string }) => {
        const files = await Promise.all(
            payload.localItem.images.map(async (img) => {
                // last 14 is `.timestamp`
                const filename = img.name.slice(0, img.name.length - 14)
                return await dataUrlToBlob(img.data, filename)
            })
        )
        let item = (await addItemApi(
            payload.token,
            payload.localItem.text,
            files
        )) as Item
        // hack for CloudFront url not showing immediately
        item.images = item.images!.map((img, i) => {
            img.thumbnail = payload.localItem.images[i].thumbnail
            return img
        })
        return { item, localItem: payload.localItem }
    }
)

type ItemsState = {
    items: Item[]
    localItems: LocalItem[]
    filteredItems: Item[] | null
    offset: number
    status: 'idle' | 'loading' | 'failed' | 'success' | 'pending'
    error: string | null
}

/** Check if we should load more items */
const isNewItem = (state: ItemsState, action: { payload: Item[] }) => {
    if (action.payload.length && state.items.length) {
        const first = action.payload[0]
        const last = state.items[state.items.length - 1]
        if (last.id <= first.id) {
            console.log('no new items')
            return false
        }
    }
    return true
}

const initialState = {
    items: [] as Item[],
    localItems: loadLocalItems() as LocalItem[],
    filteredItems: null,
    offset: 0,
    status: 'idle',
    error: null as string | null,
} as ItemsState

const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        addItem: (state, action) => {
            state.items = [action.payload, ...state.items]
            state.offset = state.items.length
        },
        addLocalItem: (state, action: { payload: LocalItem }) => {
            state.localItems = [action.payload, ...state.localItems]
        },
        editItem: (state, action: { payload: Item }) => {
            const { id, text, images } = action.payload
            const item = state.items.find((x) => x.id === id)
            if (item) {
                item.text = text
                item.images = images
            }
        },
        editLocalItem: (
            state,
            action: {
                payload: {
                    id: number
                    text: string
                    newImages: Image[]
                    deletedImages: Image[]
                }
            }
        ) => {
            const { id, text, newImages, deletedImages } = action.payload
            const item = state.localItems.find((x) => x.id === id)
            if (item) {
                item.text = text
                const deletedNames = deletedImages.map((img) => img.name)
                item.images = item.images.filter(
                    (img) => !deletedNames.includes(img.name)
                )
                item.images = [...item.images, ...newImages]
            }
        },
        deleteItem: (state, action: { payload: number }) => {
            const id = action.payload
            const index = state.items.findIndex((x) => x.id === id)
            if (index !== -1) {
                state.items.splice(index, 1)
            }
        },
        deleteLocalItem: (state, action: { payload: number }) => {
            const id = action.payload
            const index = state.localItems.findIndex((x) => x.id === id)
            if (index !== -1) {
                state.localItems.splice(index, 1)
            }
        },
        filterItems: (state, action: { payload: string }) => {
            if (action.payload.length === 0) {
                state.filteredItems = null
            }
            const pattern = new RegExp(action.payload, 'gi')
            const results = state.items.filter((x) => {
                return pattern.test(x.text)
            })
            state.filteredItems = results
        },
    },
    extraReducers(builder) {
        builder
            .addCase(addNewItem.fulfilled, (state, action) => {
                state.status = 'success'
                state.items = [action.payload, ...state.items]
                state.offset = state.items.length
            })
            .addCase(addNewItem.pending, (state, action) => {
                state.status = 'pending'
            })
            .addCase(syncItem.fulfilled, (state, action) => {
                state.status = 'success'
                const { item, localItem } = action.payload
                state.items = [item, ...state.items]
                const index = state.localItems.findIndex(
                    (x) => x.id === localItem.id
                )
                if (index !== -1) {
                    state.localItems.splice(index, 1)
                }
                state.offset = state.items.length
            })
            .addCase(syncItem.pending, (state, action) => {
                state.status = 'pending'
            })
            .addCase(syncItem.rejected, (state, action) => {
                state.status = 'failed'
            })
            .addCase(fetchItems.fulfilled, (state, action) => {
                state.status = 'success'
                if (isNewItem(state, action)) {
                    state.items = [...state.items, ...action.payload]
                    state.offset += action.payload.length
                }
            })
            .addCase(fetchItems.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.status = 'failed'
                if (action.error.message) state.error = action.error.message
            })
    },
})

export const {
    addItem,
    editItem,
    deleteItem,
    filterItems,
    addLocalItem,
    editLocalItem,
    deleteLocalItem,
} = itemsSlice.actions
export default itemsSlice.reducer
