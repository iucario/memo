import {
    Image as ImageType,
    Item as ItemType,
    LocalItem,
    LocalItemStr,
} from '../app/types'

/** Handle dev and production path */
export const imageSrc = (img: ImageType) => {
    return img.data.startsWith('data:image') ? img.data : img.data
}

export const isMac = () => {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0
}

export const selectText = (element: HTMLElement) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    const selection = window.getSelection()
    if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
    }
}

/** File to base64 */
export const blobToData = (blob: Blob) => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}

export const dataUrlToBlob = async (
    dataUrl: string,
    filename: string
): Promise<File> => {
    const res: Response = await fetch(dataUrl)
    const blob: Blob = await res.blob()
    return new File([blob], filename, { type: blob.type })
}

/** Insert text around selection */
export const insertText = (input: HTMLTextAreaElement, text: string) => {
    const start = Math.min(input.selectionStart, input.selectionEnd)
    const end = text.length + Math.max(input.selectionStart, input.selectionEnd)
    input.setRangeText(text, start, start, 'end')
    input.setRangeText(text, end, end, 'start')
    let event = new Event('input', { bubbles: true })
    input.dispatchEvent(event)
}

// TODO: change db to store int
export const dateToString = (date: number) => {
    const d = new Date(date)
    return d.toLocaleString()
}

export const randomInt = () => {
    return Math.floor(Math.random() * 1e8)
}

export const getWindowColor = () => {
    const windowColor = window.matchMedia('(prefers-color-scheme: dark)')
    return windowColor.matches ? 'dark' : 'light'
}

export async function loadImage(imageUrl: string): Promise<HTMLImageElement> {
    let img: HTMLImageElement = new Image()
    const imageLoadPromise = new Promise((resolve) => {
        img.onload = resolve
        img.src = imageUrl
    })

    await imageLoadPromise
    return img
}

export const compressImage = async (data: string, quality: number = 0.6) => {
    const maxHeight = 800
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = await loadImage(data)
    console.log('original', data.length)
    const resizeRatio = Math.min(maxHeight / img.height, 1)
    const [width, height] = [img.width * resizeRatio, img.height * resizeRatio]
    canvas.width = width
    canvas.height = height
    ctx!.drawImage(img, 0, 0, width, height)
    const canvasData = canvas.toDataURL('image/jpeg', quality)
    console.log('compressed', canvasData.length)
    return canvasData
}

export const digestMessage = async (message: string) => {
    const msgUint8 = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    return hashHex
}

export const loadLocalItems = (): LocalItem[] => {
    if (localStorage.getItem('temp') === null) {
        localStorage.setItem('temp', JSON.stringify([]))
        return []
    }
    const temp = JSON.parse(localStorage.getItem('temp')!) as LocalItemStr[]
    return temp.map((item: LocalItemStr) => {
        return {
            id: item.id,
            text: item.text,
            created_time: item.created_time,
            images: item.images.map((imgName: string, i) => {
                const b64 = localStorage.getItem(imgName)!
                return {
                    name: imgName,
                    data: b64,
                    thumbnail: b64,
                    item_id: item.id,
                    id: i,
                }
            }),
        }
    })
}

/** Sync state.localItems with local storage */
export const saveLocalItems = async (items: ItemType[]) => {
    const temp = items.map((item: ItemType) => {
        return {
            id: item.id,
            text: item.text,
            created_time: item.created_time,
            images: item.images!.map((img: ImageType) => img.name),
        }
    })
    localStorage.setItem('temp', JSON.stringify(temp))
    // Remove old images
    const currentImages = items.flatMap((item) =>
        item.images!.map((img) => img.name)
    )
    const oldImages = Object.keys(localStorage).filter(
        (key) =>
            localStorage.getItem(key)!.startsWith('data:image') &&
            !currentImages.includes(key)
    )
    oldImages.forEach((key) => localStorage.removeItem(key))
}

/** Save and returns local item images */
export const saveLocalImages = async (files: File[], timenow: number) => {
    const filenames = files.map((file) => `${file.name}_${timenow}`)

    const images = await Promise.all(
        files.map(async (file, i) => {
            const data = (await blobToData(file)) as string
            // save to local storage
            try {
                localStorage.setItem(filenames[i], data)
            } catch (err) {
                console.log(err) // Can be uploaded even if error. Do something?
            }
            return {
                name: filenames[i],
                id: randomInt(),
                data,
                thumbnail: data,
            }
        })
    )
    return images
}
