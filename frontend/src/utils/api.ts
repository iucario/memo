import { Image as ImageType } from '../app/types'

const API_BASE = process.env.REACT_APP_API || ''
const PARAM_OFFSET = 'offset='

const postItem = (
    url: string | URL,
    text: string | null,
    token: string,
    images: ImageType[] = []
) => {
    const imageJSON = images.map((img) => {
        return { data: img.data }
    })
    return fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body:
            text !== null
                ? JSON.stringify({
                      text,
                      images: imageJSON,
                  })
                : null,
    })
}

const get = (url: string | URL, token: string) => {
    return fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
}

export const loadItems = async (token: string, offset: number = 0) => {
    const url = `${API_BASE}/item/list?${PARAM_OFFSET}${offset}`
    const resp = await get(url, token)
    if (resp.status === 200) {
        const items = await resp.json()
        return items
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}

export const addItem = async (
    token: string,
    text: string = '',
    files: File[]
) => {
    const url = `${API_BASE}/item/`
    const form = new FormData()
    form.append('text', text)
    files.forEach((file) => {
        form.append('images', file)
    })
    const resp = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    })
    if (resp.status === 200) {
        return await resp.json()
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}

/** Send modified text and deleted image ids and new binary files */
export const postEdit = async (
    token: string,
    itemId: number,
    text: string | null,
    delImages: ImageType[] = [],
    addImages: File[] = []
) => {
    const url = `${API_BASE}/item/${itemId}`
    const form = new FormData()
    form.append('text', text || '')
    delImages.forEach((img) => {
        form.append('delete', `${img.id}`)
    })
    addImages.forEach((file) => {
        form.append('add', file)
    })
    const resp = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: form,
    })
    if (resp.status === 200) {
        return await resp.json()
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}

export const delItem = async (token: string, id: number) => {
    const url = `${API_BASE}/item/${id}`
    const resp = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    if (resp.status === 200) {
        const index = parseInt(await resp.text())
        return index
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}

export const register = async (name: string, password: string) => {
    const resp = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
    })
    if (resp.status === 200) {
        return await resp.json()
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}

export const login = async (username: string, password: string) => {
    const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}`,
    })
    if (resp.status === 200) {
        const { access_token, token_type } = await resp.json()
        return { access_token, token_type }
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}

export const getMe = async (token: string) => {
    const resp = await fetch(`${API_BASE}/user/me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    if (resp.status === 200) {
        return await resp.json()
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}

export const exportData = async (token: string) => {
    const resp = await fetch(`${API_BASE}/user/export`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    if (resp.status === 200) {
        return resp.blob()
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}

export const getRecycleBin = async (token: string) => {
    const resp = await fetch(`${API_BASE}/item/recycle`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    if (resp.status === 200) {
        return await resp.json()
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}

export const restoreItem = async (token: string, id: number) => {
    const url = `${API_BASE}/item/restore/${id}`
    const resp = await postItem(url, null, token)
    if (resp.status === 200) {
        return await resp.json()
    } else {
        throw new Error(`${resp.status} ${resp.text}`)
    }
}
