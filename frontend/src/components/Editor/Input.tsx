import { useEffect, useRef } from 'react'
import { insertText, isMac } from '../../utils/utils'

type InputAreaProps = {
  id: string
  initValue: string // Used for editing
  onSave: () => void
  onChange: (e: any) => void
  onExit?: () => void
  onPaste: (e: any) => void
}

const InputArea = ({
  id,
  initValue,
  onSave,
  onExit,
  onChange,
  onPaste,
}: InputAreaProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const HEIGHT = 20

  useEffect(() => {
    // Focus and set initial value. Useful for editing.
    if (inputRef.current) {
      inputRef.current.value = initValue
      inputRef.current.focus()
    }
    adjustHeight()
  }, [])

  const handleChange = (e: any) => {
    onChange(e)
    adjustHeight()
  }

  const handleKeyDown = (e: any) => {
    e.stopPropagation()
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      // save
      onSave()
    } else if (e.key === 'Escape') {
      onExit && onExit()
      inputRef.current?.blur()
    } else if (
      (!isMac() && (e.ctrlKey || e.metaKey) && e.key === 'b') ||
      (e.metaKey && e.key === 'b')
    ) {
      // bold
      e.preventDefault()
      insertText(inputRef.current!, '**')
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      // italic
      e.preventDefault()
      insertText(inputRef.current!, '*')
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
      // code
      e.preventDefault()
      insertText(inputRef.current!, '`')
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
      // code block
      e.preventDefault()
      insertText(inputRef.current!, '```')
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      // link
      e.preventDefault()
      inputRef.current?.setRangeText(
        '[]()',
        inputRef.current.selectionStart,
        inputRef.current.selectionStart,
        'start'
      )
    }
  }

  const adjustHeight = () => {
    // Auto adjust height of textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height =
        inputRef.current.scrollHeight + HEIGHT + 'px'
    }
  }

  return (
    <textarea
      id={id}
      defaultValue={initValue}
      className="input-area"
      ref={inputRef}
      onKeyDown={handleKeyDown}
      onInput={adjustHeight}
      onChange={handleChange}
      onPaste={onPaste}
    ></textarea>
  )
}

export default InputArea
