import { useRef } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import 'ckeditor5/ckeditor5.css'
import { ClassicEditor } from 'ckeditor5'
import { ConfigRichTextEditor } from './config'
import RichTextEditor4 from './RichTextEditor4'

export default function Editor({
    content,
    onChange,
    invalid,
    className,
}: {
    content: string
    onChange: (data: string) => void
    invalid: boolean
    className?: string
}) {
    const editorRef = useRef<any>(null)

    return (
        <div
            className={`border-2 rounded-md overflow-hidden ${
                invalid ? 'border-red-400 border-2 ' : 'border-transparent'
            } ${className}`}
        >
            <CKEditor
                editor={ClassicEditor}
                data={content}
                onReady={(editor: any) => {
                    editorRef.current = editor
                }}
                config={ConfigRichTextEditor}
                onChange={(_: any, editor: any) => {
                    const html = editor.getData()
                    onChange(html)
                }}
            />
            {/* <RichTextEditor4
            content={content}
            onChange={setData}
            /> */}
        </div>
    )
}
