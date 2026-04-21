import { forwardRef } from 'react'
import classNames from '@/utils/classNames'
import ToolButtonBold from './toolButtons/ToolButtonBold'
import ToolButtonItalic from './toolButtons/ToolButtonItalic'
import ToolButtonStrike from './toolButtons/ToolButtonStrike'
import ToolButtonCode from './toolButtons/ToolButtonCode'
import ToolButtonOrderedList from './toolButtons/ToolButtonOrderedList'
import ToolButtonCodeBlock from './toolButtons/ToolButtonCodeBlock'
import ToolButtonBlockquote from './toolButtons/ToolButtonBlockquote'
import ToolButtonHorizontalRule from './toolButtons/ToolButtonHorizontalRule'
import ToolButtonHeading from './toolButtons/ToolButtonHeading'
import ToolButtonParagraph from './toolButtons/ToolButtonParagraph'
import ToolButtonUndo from './toolButtons/ToolButtonUndo'
import ToolButtonRedo from './toolButtons/ToolButtonRedo'
import ToolButtonBulletList from './toolButtons/ToolButtonBulletList'
import ToolButtonLink from './toolButtons/ToolButtonLink'
import ToolButtonImage from './toolButtons/ToolButtonImage'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import type { Editor, EditorContentProps, JSONContent } from '@tiptap/react'
import type { ReactNode } from 'react'
import type { BaseToolButtonProps, HeadingLevel } from './toolButtons/types'

type RichTextEditorProps = {
    content?: string
    invalid?: boolean
    customToolBar?: (
        editor: Editor,
        components: {
            ToolButtonBold: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonItalic: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonStrike: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonCode: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonBlockquote: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonHeading: ({
                editor,
            }: BaseToolButtonProps & {
                headingLevel?: HeadingLevel[]
            }) => JSX.Element
            ToolButtonBulletList: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonOrderedList: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonCodeBlock: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonHorizontalRule: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonParagraph: ({
                editor,
            }: BaseToolButtonProps) => JSX.Element
            ToolButtonUndo: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonRedo: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonLink: ({ editor }: BaseToolButtonProps) => JSX.Element
            ToolButtonImage: ({ editor }: BaseToolButtonProps) => JSX.Element
        },
    ) => ReactNode
    onChange?: (content: {
        text: string
        html: string
        json: JSONContent
    }) => void
    editorContentClass?: string
    customEditor?: Editor | null
} & Omit<EditorContentProps, 'editor' | 'ref' | 'onChange'>

export type RichTextEditorRef = HTMLDivElement

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
    (props, ref) => {
        const {
            content = '',
            customToolBar,
            invalid,
            onChange,
            editorContentClass,
            customEditor,
            ...rest
        } = props

        const editor = customEditor
            ? customEditor
            : // eslint-disable-next-line react-hooks/rules-of-hooks
              useEditor({
                  extensions: [
                      StarterKit.configure({
                          bulletList: {
                              keepMarks: true,
                          },
                          orderedList: {
                              keepMarks: true,
                          },
                      }),
                      Link.configure({
                          openOnClick: false,
                          HTMLAttributes: {
                              class: 'text-blue-500 underline hover:text-blue-700',
                          },
                      }),
                      Image.configure({
                          HTMLAttributes: {
                              class: 'max-w-full h-auto rounded',
                          },
                      }),
                  ],
                  editable: props.disabled ? false : true,
                  editorProps: {
                      attributes: {
                          class: 'm-2 focus:outline-none',
                      },
                  },
                  content,
                  onUpdate({ editor }) {
                      onChange?.({
                          text: editor.getText(),
                          html: editor.getHTML(),
                          json: editor.getJSON(),
                      })
                  },
              })

        if (!editor) return null

        return (
            <div
                className={classNames(
                    `rich-text-editor rounded-xl ring-1 ring-gray-200 dark:ring-gray-600 ${props.disabled ? 'border-none bg-white rounded-none right-0 ring-white' : 'border border-gray-200 bg-gray-100 '}  dark:border-gray-600 dark:bg-gray-700 pt-3`,
                    editor.isFocused && 'ring-primary border-primary',
                    invalid && 'bg-error-subtle',
                    editor.isFocused &&
                        invalid &&
                        'bg-error-subtle ring-error border-error',
                )}
            >
                {props.disabled ? (
                    <></>
                ) : (
                    <div className="flex gap-x-1 gap-y-2 px-2">
                        {customToolBar ? (
                            customToolBar(editor, {
                                ToolButtonBold,
                                ToolButtonItalic,
                                ToolButtonStrike,
                                ToolButtonCode,
                                ToolButtonBlockquote,
                                ToolButtonHeading,
                                ToolButtonBulletList,
                                ToolButtonOrderedList,
                                ToolButtonCodeBlock,
                                ToolButtonHorizontalRule,
                                ToolButtonParagraph,
                                ToolButtonUndo,
                                ToolButtonRedo,
                                ToolButtonLink,
                                ToolButtonImage,
                            })
                        ) : (
                            <>
                                <ToolButtonBold editor={editor} />
                                <ToolButtonItalic editor={editor} />
                                <ToolButtonStrike editor={editor} />
                                <ToolButtonCode editor={editor} />
                                <ToolButtonBlockquote editor={editor} />
                                <ToolButtonHeading editor={editor} />
                                <ToolButtonBulletList editor={editor} />
                                <ToolButtonOrderedList editor={editor} />
                                <ToolButtonCodeBlock editor={editor} />
                                <ToolButtonHorizontalRule editor={editor} />
                                <ToolButtonLink editor={editor} />
                                <ToolButtonImage editor={editor} />
                            </>
                        )}
                    </div>
                )}

                <EditorContent
                    ref={ref}
                    className={classNames(
                        `${props.disabled ? '' : 'max-h-[600px]'} overflow-auto px-2 prose prose-p:text-sm prose-p:dark:text-gray-400 max-w-full`,
                        editorContentClass,
                    )}
                    editor={editor}
                    {...rest}
                />
            </div>
        )
    },
)

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
