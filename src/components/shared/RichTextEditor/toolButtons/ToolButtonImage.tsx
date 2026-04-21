// import { IoMdImage } from 'react-icons/io'
// import { BaseToolButtonProps } from './types'
// import { useCallback, useState } from 'react'
// import ToolButton from './ToolButton'
// import {
//     Button,
//     Dialog,
//     FormItem,
//     Input,
//     Notification,
//     toast,
//     Upload,
// } from '@/components/ui'
// import { usePost2 } from '@/service/post.service'

// const fileUrl = import.meta.env.VITE_FileServer

// const ToolButtonImage = ({ editor }: BaseToolButtonProps) => {
//     const [isOpen, setIsOpen] = useState(false)
//     const [url, setUrl] = useState('')
//     const [file, setFile] = useState<File | null>(null)
//     const [uploading, setUploading] = useState(false)
//     const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url')

//     const { mutate: uploadImage } = usePost2('upload')

//     const handleOpen = useCallback(() => {
//         setIsOpen(true)
//     }, [])

//     const handleClose = () => {
//         setIsOpen(false)
//         setUrl('')
//         setFile(null)
//         setActiveTab('url')
//     }

//     const handleFileChange = (files: File[]) => {
//         if (files.length > 0) {
//             setFile(files[0])
//         }
//     }

//     const handleUpload = () => {
//         if (!file) {
//             toast.push(
//                 <Notification
//                     title="Iltimos, faylni tanlang"
//                     type="warning"
//                     closable
//                 />,
//             )
//             return
//         }

//         const formData = new FormData()
//         formData.append('images', file)

//         setUploading(true)
//         uploadImage(
//             {
//                 url: `${fileUrl}api/upload`,
//                 body: formData,
//             },
//             {
//                 onSuccess: (res) => {
//                     if (res?.url) {
//                         const imageUrl = res?.url

//                         if (imageUrl) {
//                             editor
//                                 .chain()
//                                 .focus()
//                                 .insertContent(
//                                     `<img src="${imageUrl}" alt="Rasm" class="max-w-full h-auto rounded" />`,
//                                 )
//                                 .run()

//                             toast.push(
//                                 <Notification
//                                     title="Rasm muvaffaqiyatli yuklandi"
//                                     type="success"
//                                     closable
//                                 />,
//                             )
//                             handleClose()
//                         } else {
//                             toast.push(
//                                 <Notification
//                                     title="Javobda rasm manzili topilmadi"
//                                     type="danger"
//                                     closable
//                                 />,
//                             )
//                         }
//                     } else {
//                         toast.push(
//                             <Notification
//                                 title={
//                                     res?.response?.data?.message ||
//                                     'Yuklashda xatolik yuz berdi'
//                                 }
//                                 type="danger"
//                                 closable
//                             />,
//                         )
//                     }
//                 },
//                 onError: () => {
//                     toast.push(
//                         <Notification
//                             title="Yuklashda xatolik yuz berdi"
//                             type="danger"
//                             closable
//                         />,
//                     )
//                 },
//                 onSettled: () => {
//                     setUploading(false)
//                 },
//             },
//         )
//     }

//     const handleSubmitUrl = (e: React.FormEvent) => {
//         e.preventDefault()

//         if (url) {
//             editor
//                 .chain()
//                 .focus()
//                 .insertContent(
//                     `<img src="${url}" alt="Rasm" class="max-w-full h-auto rounded" />`,
//                 )
//                 .run()

//             handleClose()
//         }
//     }

//     return (
//         <>
//             <ToolButton onClick={handleOpen} type="button" title="Rasm qo‘shish">
//                 <IoMdImage />
//             </ToolButton>

//             <Dialog
//                 isOpen={isOpen}
//                 onClose={handleClose}
//                 onRequestClose={handleClose}
//             >
//                 <div>
//                     <h5 className="mb-4">Rasm qo‘shish</h5>

//                     {/* Tabs */}
//                     <div className="flex gap-2 mb-4 border-b border-gray-200">
//                         <button
//                             type="button"
//                             onClick={() => setActiveTab('url')}
//                             className={`pb-2 px-4 ${
//                                 activeTab === 'url'
//                                     ? 'border-b-2 border-blue-500 text-blue-500'
//                                     : 'text-gray-500'
//                             }`}
//                         >
//                             Rasm URL manzili
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => setActiveTab('upload')}
//                             className={`pb-2 px-4 ${
//                                 activeTab === 'upload'
//                                     ? 'border-b-2 border-blue-500 text-blue-500'
//                                     : 'text-gray-500'
//                             }`}
//                         >
//                             Rasm yuklash
//                         </button>
//                     </div>

//                     {/* URL Tab */}
//                     {activeTab === 'url' && (
//                         <form>
//                             <FormItem label="Rasm URL manzili">
//                                 <Input
//                                     type="url"
//                                     value={url}
//                                     onChange={(e) => setUrl(e.target.value)}
//                                     placeholder="https://misol.com/rasm.jpg"
//                                     required
//                                 />
//                             </FormItem>

//                             <div className="flex items-center justify-end gap-2 mt-4">
//                                 <Button
//                                     type="button"
//                                     variant="default"
//                                     size="sm"
//                                     onClick={handleClose}
//                                 >
//                                     Bekor qilish
//                                 </Button>
//                                 <Button
//                                     type="button"
//                                     onClick={handleSubmitUrl}
//                                     variant="solid"
//                                     size="sm"
//                                 >
//                                     Qo‘shish
//                                 </Button>
//                             </div>
//                         </form>
//                     )}

//                     {/* Upload Tab */}
//                     {activeTab === 'upload' && (
//                         <div>
//                             <FormItem label="Rasmni tanlang">
//                                 <Upload
//                                     onChange={handleFileChange}
//                                     accept="image/*"
//                                     uploadLimit={1}
//                                 >
//                                     <Button type="button" variant="default">
//                                         Fayl tanlash
//                                     </Button>
//                                 </Upload>
//                                 {file && (
//                                     <p className="mt-2 text-sm text-gray-600">
//                                         Tanlangan fayl: {file.name}
//                                     </p>
//                                 )}
//                             </FormItem>

//                             <div className="flex items-center justify-end gap-2 mt-4">
//                                 <Button
//                                     type="button"
//                                     variant="default"
//                                     size="sm"
//                                     onClick={handleClose}
//                                 >
//                                     Bekor qilish
//                                 </Button>
//                                 <Button
//                                     type="button"
//                                     variant="solid"
//                                     size="sm"
//                                     onClick={handleUpload}
//                                     loading={uploading}
//                                 >
//                                     Yuklash va qo‘shish
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </Dialog>
//         </>
//     )
// }

// export default ToolButtonImage

import { useCallback } from 'react'
import { PiImageSquare } from 'react-icons/pi'
import type { BaseToolButtonProps } from './types'

export default function ToolButtonImage({ editor }: BaseToolButtonProps) {
    const handleImageSelect = useCallback(() => {
        // Yangi tab ochish
        const fileManagerUrl = '/dashboards/files?mode=picker'
        const width = 1000
        const height = 600
        const left = (window.screen.width - width) / 2
        const top = (window.screen.height - height) / 2
        const newWindow = window.open(
            fileManagerUrl,
            '_blank',
            `width=${width},height=${height},left=${left},top=${top}`,
        )

        // Message listener - yangi tab'dan rasm kelganda
        const handleMessage = (event: MessageEvent) => {
            // Xavfsizlik: faqat o'z domendan xabarlar
            if (event.origin !== window.location.origin) {
                return
            }

            if (event.data.type === 'IMAGE_SELECTED' && event.data.url) {
                const imageUrl = event.data.url

                // Rasmni TipTap editor'ga qo'shish
                editor.chain().focus().setImage({ src: imageUrl }).run()

                // Tab'ni yopish
                if (newWindow && !newWindow.closed) {
                    newWindow.close()
                }

                // Listener'ni o'chirish
                window.removeEventListener('message', handleMessage)
            }
        }

        // Listener qo'shish
        window.addEventListener('message', handleMessage)

        // Agar tab yopilsa, listener'ni tozalash
        const checkClosed = setInterval(() => {
            if (newWindow && newWindow.closed) {
                window.removeEventListener('message', handleMessage)
                clearInterval(checkClosed)
            }
        }, 500)
    }, [editor])

    return (
        <button
            type="button"
            title="Add image"
            onClick={handleImageSelect}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        >
            <PiImageSquare className="text-lg" />
        </button>
    )
}
