import { IoIosLink } from 'react-icons/io'
import ToolButton from './ToolButton'
import { BaseToolButtonProps } from './types'
import { useCallback, useState } from 'react'
import { Button, Dialog, FormItem, Input } from '@/components/ui'

const ToolButtonLink = ({ editor }: BaseToolButtonProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [url, setUrl] = useState('')
    const [text, setText] = useState('')

    const handleOpen = useCallback(() => {
        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to, ' ')

        if (selectedText) {
            setText(selectedText)
        }

        setIsOpen(true)
    }, [editor])

    const handleClose = () => {
        setIsOpen(false)
        setUrl('')
        setText('')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (url) {
            const linkText = text || url
            editor
                .chain()
                .focus()
                .insertContent(
                    `<a href="${url}" target="_blank" class="text-blue-500 underline hover:text-blue-700">${linkText}</a>`,
                )
                .run()

            handleClose()
        }
    }

    return (
        <>
            <ToolButton
                onClick={handleOpen}
                type="button"
                title="Havola qo‘shish"
            >
                <IoIosLink />
            </ToolButton>

            <Dialog
                isOpen={isOpen}
                onClose={handleClose}
                onRequestClose={handleClose}
            >
                <form>
                    <h5 className="mb-4">Havola qo‘shish</h5>

                    <FormItem label="Matn">
                        <Input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Matn kiriting"
                        />
                    </FormItem>

                    <FormItem label="URL manzil">
                        <Input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://misol.com"
                            required
                        />
                    </FormItem>

                    <div className="flex items-center justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={handleClose}
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            type="button"
                            variant="solid"
                            size="sm"
                        >
                            Qo‘shish
                        </Button>
                    </div>
                </form>
            </Dialog>
        </>
    )
}

export default ToolButtonLink
