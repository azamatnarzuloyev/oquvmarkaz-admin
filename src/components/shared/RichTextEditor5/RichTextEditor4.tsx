
import { CKEditor } from 'ckeditor4-react'

// Dialog instance type
interface CKEditorDialog {
    _: {
        currentTabId: string
    }
    setValueOf: (tabId: string, elementId: string, value: any) => void
    getValueOf: (tabId: string, elementId: string) => any
    hide: () => void
}

function RichTextEditor4({ content, onChange }: any) {
    return (
        <>
            <CKEditor
                
                onBeforeLoad={(CKEDITOR: any) => {
                    // Custom video plugin
                    if (!CKEDITOR.plugins.get('customvideo')) {
                        CKEDITOR.plugins.add('customvideo', {
                            icons: 'customvideo',
                            requires: 'widget,dialog',
                            init: function (editor: any) {
                                // Video widget
                                editor.widgets.add('customvideo', {
                                    button: 'Insert Video',
                                    template: '<div class="video-widget" data-align="none"><video controls style="max-width:100%;"><source src=""></video></div>',
                                    editables: {},
                                    allowedContent: 'div(!video-widget)[data-align,style]; video[*]{*}(*); source[*]; iframe[*]{*}(*)',
                                    requiredContent: 'div(video-widget)',
                                    upcast: function (element: any) {
                                        return element.name === 'div' && element.hasClass('video-widget')
                                    },
                                    init: function () {
                                        const align = this.element.getAttribute('data-align') || 'none'
                                        this.setData('align', align)
                                    },
                                    data: function () {
                                        const align = this.data.align || 'none'
                                        this.element.setAttribute('data-align', align)
                                        
                                        let style = ''
                                        if (align === 'left') {
                                            style = 'display: inline-block; margin-right: 15px;'
                                        } else if (align === 'right') {
                                            style = 'display: inline-block; margin-left: 15px;'
                                        } else if (align === 'center') {
                                            style = 'display: block; margin: 0 auto;'
                                        } else {
                                            style = 'display: inline-block;'
                                        }
                                        this.element.setAttribute('style', style)
                                    }
                                })

                                // Context menu - rasm, video va iframe uchun
                                if (editor.contextMenu) {
                                    editor.addMenuGroup('mediaGroup')
                                    
                                    editor.addMenuItem('videoProperties', {
                                        label: 'Video Properties',
                                        icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
                                        command: 'editVideoProperties',
                                        group: 'mediaGroup'
                                    })

                                    editor.contextMenu.addListener(function (element: any) {
                                        if (element) {
                                            // Video yoki iframe tekshirish
                                            const video = element.getAscendant('video', true) || element.getAscendant('iframe', true)
                                            const isVideo = element.getName && (element.getName() === 'video' || element.getName() === 'iframe')
                                            const videoWidget = element.getAscendant(function(el: any) {
                                                return el.hasClass && el.hasClass('video-widget')
                                            }, true)
                                            
                                            if (video || isVideo || videoWidget) {
                                                return { videoProperties: CKEDITOR.TRISTATE_OFF }
                                            }
                                        }
                                    })
                                }

                                // Edit video properties command
                                editor.addCommand('editVideoProperties', {
                                    exec: function(editor: any) {
                                        const selection = editor.getSelection()
                                        const element = selection.getStartElement()
                                        
                                        let videoElement = null
                                        let iframeElement = null
                                        let videoWidget = null
                                        
                                        // Video widget topish
                                        videoWidget = element.getAscendant(function(el: any) {
                                            return el.hasClass && el.hasClass('video-widget')
                                        }, true)
                                        
                                        if (videoWidget) {
                                            videoElement = videoWidget.findOne('video')
                                            iframeElement = videoWidget.findOne('iframe')
                                        } else {
                                            videoElement = element.getAscendant('video', true) || (element.getName && element.getName() === 'video' ? element : null)
                                            iframeElement = element.getAscendant('iframe', true) || (element.getName && element.getName() === 'iframe' ? element : null)
                                        }
                                        
                                        if (videoElement || iframeElement) {
                                            editor.execCommand('openVideoDialog')
                                            
                                            // Dialog ochilgandan keyin ma'lumotlarni to'ldirish
                                            const dialog = CKEDITOR.dialog.getCurrent()
                                            if (dialog) {
                                                setTimeout(() => {
                                                    if (videoElement) {
                                                        const source = videoElement.findOne('source')
                                                        const videoUrl = source ? source.getAttribute('src') : ''
                                                        const width = videoElement.getStyle('width') || '640px'
                                                        const height = videoElement.getStyle('height') || '360px'
                                                        const align = videoWidget ? videoWidget.getAttribute('data-align') : 'none'
                                                        const controls = videoElement.hasAttribute('controls')
                                                        const autoplay = videoElement.hasAttribute('autoplay')
                                                        
                                                        dialog.setValueOf('tab-upload', 'videoUrl', videoUrl)
                                                        dialog.setValueOf('tab-upload', 'width', width.replace('px', ''))
                                                        dialog.setValueOf('tab-upload', 'height', height.replace('px', ''))
                                                        dialog.setValueOf('tab-upload', 'align', align)
                                                        dialog.setValueOf('tab-upload', 'controls', controls)
                                                        dialog.setValueOf('tab-upload', 'autoplay', autoplay)
                                                        
                                                        // Eski videoni o'chirish uchun saqlash
                                                        if (videoWidget) {
                                                            videoWidget.remove()
                                                        }
                                                    } else if (iframeElement) {
                                                        const src = iframeElement.getAttribute('src')
                                                        const width = iframeElement.getStyle('width') || '640px'
                                                        const height = iframeElement.getStyle('height') || '360px'
                                                        const align = videoWidget ? videoWidget.getAttribute('data-align') : 'none'
                                                        
                                                        dialog.setValueOf('tab-youtube', 'youtubeUrl', src)
                                                        dialog.setValueOf('tab-youtube', 'ytWidth', width.replace('px', ''))
                                                        dialog.setValueOf('tab-youtube', 'ytHeight', height.replace('px', ''))
                                                        
                                                        // Eski iframe o'chirish
                                                        if (videoWidget) {
                                                            videoWidget.remove()
                                                        }
                                                    }
                                                }, 100)
                                            }
                                        }
                                    }
                                })

                                // Video dialog
                                CKEDITOR.dialog.add('videoDialog', function (editor: any) {
                                    return {
                                        title: 'Insert Video',
                                        minWidth: 500,
                                        minHeight: 400,
                                        contents: [
                                            {
                                                id: 'tab-upload',
                                                label: 'Upload',
                                                elements: [
                                                    {
                                                        type: 'html',
                                                        html: `
                                                            <div style="padding: 10px;">
                                                                <p style="margin-bottom: 10px; color: #666;">Allowed: MP4, WebM, Ogv</p>
                                                              <div style="display: grid; gap: 10px;">
                                                                <input type="file" id="videoFileInput" accept="video/*" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;">
                                                                <button type="button" id="browseFilesBtn" style="width: 100%; padding: 10px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                                                                    Browse from File Manager
                                                                </button>
                                                              </div>
                                                                <div id="uploadProgress" style="margin-top: 10px; display: none;">
                                                                    <div style="background: #f0f0f0; border-radius: 4px; overflow: hidden;">
                                                                        <div id="progressBar" style="background: #4CAF50; height: 20px; width: 0%; transition: width 0.3s;"></div>
                                                                    </div>
                                                                    <p id="progressText" style="margin-top: 5px; font-size: 12px; color: #666;"></p>
                                                                </div>
                                                            </div>
                                                        `,
                                                    },
                                                    {
                                                        type: 'text',
                                                        id: 'videoUrl',
                                                        label: 'Video URL',
                                                    },
                                                    {
                                                        type: 'hbox',
                                                        widths: ['50%', '50%'],
                                                        children: [
                                                            {
                                                                type: 'text',
                                                                id: 'width',
                                                                label: 'Width (px)',
                                                                default: '640',
                                                            },
                                                            {
                                                                type: 'text',
                                                                id: 'height',
                                                                label: 'Height (px)',
                                                                default: '360',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'select',
                                                        id: 'align',
                                                        label: 'Alignment',
                                                        items: [
                                                            ['None (inline)', 'none'],
                                                            ['Left', 'left'],
                                                            ['Center', 'center'],
                                                            ['Right', 'right'],
                                                        ],
                                                        default: 'none',
                                                    },
                                                    {
                                                        type: 'checkbox',
                                                        id: 'responsive',
                                                        label: 'Responsive (fit to width)',
                                                    },
                                                    {
                                                        type: 'hbox',
                                                        widths: ['50%', '50%'],
                                                        children: [
                                                            {
                                                                type: 'checkbox',
                                                                id: 'autoplay',
                                                                label: 'Autoplay',
                                                            },
                                                            {
                                                                type: 'checkbox',
                                                                id: 'controls',
                                                                label: 'Show controls',
                                                                default: 'checked',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            {
                                                id: 'tab-youtube',
                                                label: 'YouTube',
                                                elements: [
                                                    {
                                                        type: 'textarea',
                                                        id: 'embedCode',
                                                        label: 'Paste Embed Code',
                                                        rows: 4,
                                                    },
                                                    {
                                                        type: 'text',
                                                        id: 'youtubeUrl',
                                                        label: 'YouTube URL',
                                                    },
                                                    {
                                                        type: 'hbox',
                                                        widths: ['50%', '50%'],
                                                        children: [
                                                            {
                                                                type: 'text',
                                                                id: 'ytWidth',
                                                                label: 'Width',
                                                                default: '640',
                                                            },
                                                            {
                                                                type: 'text',
                                                                id: 'ytHeight',
                                                                label: 'Height',
                                                                default: '360',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'select',
                                                        id: 'ytAlign',
                                                        label: 'Alignment',
                                                        items: [
                                                            ['None (inline)', 'none'],
                                                            ['Left', 'left'],
                                                            ['Center', 'center'],
                                                            ['Right', 'right'],
                                                        ],
                                                        default: 'none',
                                                    },
                                                    {
                                                        type: 'checkbox',
                                                        id: 'ytResponsive',
                                                        label: 'Responsive (fit to width)',
                                                    },
                                                    {
                                                        type: 'hbox',
                                                        widths: ['33%', '33%', '34%'],
                                                        children: [
                                                            {
                                                                type: 'checkbox',
                                                                id: 'ytControls',
                                                                label: 'Controls',
                                                                default: 'checked',
                                                            },
                                                            {
                                                                type: 'checkbox',
                                                                id: 'ytAutoplay',
                                                                label: 'Autoplay',
                                                            },
                                                            {
                                                                type: 'checkbox',
                                                                id: 'showSuggested',
                                                                label: 'Related videos',
                                                                default: 'checked',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                        onShow: function (this: CKEditorDialog) {
                                            const dialog = this
                                            
                                            // Clear all fields
                                            dialog.setValueOf('tab-upload', 'videoUrl', '')
                                            dialog.setValueOf('tab-upload', 'width', '640')
                                            dialog.setValueOf('tab-upload', 'height', '360')
                                            dialog.setValueOf('tab-upload', 'align', 'none')
                                            dialog.setValueOf('tab-upload', 'responsive', false)
                                            dialog.setValueOf('tab-upload', 'autoplay', false)
                                            dialog.setValueOf('tab-upload', 'controls', true)
                                            
                                            dialog.setValueOf('tab-youtube', 'embedCode', '')
                                            dialog.setValueOf('tab-youtube', 'youtubeUrl', '')
                                            dialog.setValueOf('tab-youtube', 'ytWidth', '640')
                                            dialog.setValueOf('tab-youtube', 'ytHeight', '360')
                                            dialog.setValueOf('tab-youtube', 'ytAlign', 'none')
                                            dialog.setValueOf('tab-youtube', 'ytResponsive', false)
                                            dialog.setValueOf('tab-youtube', 'ytControls', true)
                                            dialog.setValueOf('tab-youtube', 'ytAutoplay', false)
                                            dialog.setValueOf('tab-youtube', 'showSuggested', true)

                                            const uploadProgress = document.getElementById('uploadProgress')
                                            if (uploadProgress) uploadProgress.style.display = 'none'
                                            
                                            const fileInput = document.getElementById('videoFileInput') as HTMLInputElement | null
                                            if (fileInput) fileInput.value = ''

                                            // File input handler
                                            if (fileInput) {
                                                fileInput.onchange = async function (e: Event) {
                                                    const target = e.target as HTMLInputElement
                                                    const file = target.files?.[0]
                                                    if (!file) return

                                                    const formData = new FormData()
                                                    formData.append('files', file)

                                                    const uploadProgress = document.getElementById('uploadProgress')
                                                    const progressBar = document.getElementById('progressBar') as HTMLDivElement | null
                                                    const progressText = document.getElementById('progressText')

                                                    if (uploadProgress) uploadProgress.style.display = 'block'
                                                    if (progressText) progressText.textContent = 'Uploading...'
                                                    if (progressBar) progressBar.style.backgroundColor = '#4CAF50'

                                                    try {
                                                        const xhr = new XMLHttpRequest()

                                                        xhr.upload.onprogress = function (e: ProgressEvent) {
                                                            if (e.lengthComputable) {
                                                                const percent = (e.loaded / e.total) * 100
                                                                if (progressBar) progressBar.style.width = percent + '%'
                                                                if (progressText) progressText.textContent = `Uploading: ${Math.round(percent)}%`
                                                            }
                                                        }

                                                        xhr.onload = function () {
                                                            if (xhr.status === 200) {
                                                                const data = JSON.parse(xhr.responseText)
                                                                if (data.ok) {
                                                                    const videoUrl = `http://localhost:5000/${file.name}`
                                                                    dialog.setValueOf('tab-upload', 'videoUrl', videoUrl)
                                                                    if (progressText) progressText.textContent = 'Upload successful!'
                                                                    if (progressBar) progressBar.style.backgroundColor = '#4CAF50'
                                                                }
                                                            } else {
                                                                if (progressText) progressText.textContent = 'Upload failed!'
                                                                if (progressBar) progressBar.style.backgroundColor = '#f44336'
                                                            }
                                                        }

                                                        xhr.open('POST', 'http://localhost:5000/api/fm/upload?path=/')
                                                        xhr.send(formData)
                                                    } catch (error) {
                                                        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                                                        alert('Video upload error: ' + errorMessage)
                                                        if (uploadProgress) uploadProgress.style.display = 'none'
                                                    }
                                                }
                                            }

                                            // Browse files button
                                            const browseBtn = document.getElementById('browseFilesBtn')
                                            if (browseBtn) {
                                                browseBtn.onclick = function () {
                                                    const pickerUrl = '/dashboards/files?mode=picker&type=file'
                                                    const picker = window.open(pickerUrl, 'File Picker', 'width=900,height=600')
                                                    
                                                    window.addEventListener('message', function handleMessage(event) {
                                                        if (event.data && event.data.type === 'VIDEO_SELECTED') {
                                                            const fileUrl = event.data.url || event.data.path
                                                            if (fileUrl) {
                                                                dialog.setValueOf('tab-upload', 'videoUrl', fileUrl)
                                                                const progressText = document.getElementById('progressText')
                                                                const uploadProgress = document.getElementById('uploadProgress')
                                                                if (progressText) progressText.textContent = 'File selected!'
                                                                if (uploadProgress) {
                                                                    uploadProgress.style.display = 'block'
                                                                    const progressBar = document.getElementById('progressBar') as HTMLDivElement
                                                                    if (progressBar) {
                                                                        progressBar.style.width = '100%'
                                                                        progressBar.style.backgroundColor = '#4CAF50'
                                                                    }
                                                                }
                                                            }
                                                            window.removeEventListener('message', handleMessage)
                                                            if (picker) picker.close()
                                                        }
                                                    })
                                                }
                                            }
                                        },
                                        onOk: function (this: CKEditorDialog) {
                                            const dialog = this
                                            const activeTab = dialog._.currentTabId

                                            if (activeTab === 'tab-upload') {
                                                const videoUrl = dialog.getValueOf('tab-upload', 'videoUrl') as string
                                                if (!videoUrl) {
                                                    alert('Please upload a video or enter URL')
                                                    return false
                                                }

                                                const width = (dialog.getValueOf('tab-upload', 'width') as string) || '640'
                                                const height = (dialog.getValueOf('tab-upload', 'height') as string) || '360'
                                                const align = dialog.getValueOf('tab-upload', 'align') as string
                                                const responsive = dialog.getValueOf('tab-upload', 'responsive') as boolean
                                                const autoplay = dialog.getValueOf('tab-upload', 'autoplay') as boolean
                                                const controls = dialog.getValueOf('tab-upload', 'controls') as boolean

                                                let containerStyle = ''
                                                if (align === 'center') {
                                                    containerStyle = 'display: block; margin: 0 auto;'
                                                } else if (align === 'left') {
                                                    containerStyle = 'display: inline-block; margin-right: 15px;'
                                                } else if (align === 'right') {
                                                    containerStyle = 'display: inline-block; margin-left: 15px;'
                                                } else {
                                                    containerStyle = 'display: inline-block;'
                                                }

                                                const videoStyle = responsive
                                                    ? 'max-width: 100%; height: auto;'
                                                    : `width: ${width}px; height: ${height}px;`

                                                const videoHtml = `<div class="video-widget" data-align="${align}" style="${containerStyle}"><video ${controls ? 'controls' : ''} ${autoplay ? 'autoplay muted' : ''} style="${videoStyle}"><source src="${videoUrl}">Your browser does not support the video tag.</video></div>`

                                                editor.insertHtml(videoHtml)
                                            } else if (activeTab === 'tab-youtube') {
                                                const embedCode = dialog.getValueOf('tab-youtube', 'embedCode') as string
                                                const youtubeUrl = dialog.getValueOf('tab-youtube', 'youtubeUrl') as string

                                                if (embedCode) {
                                                    editor.insertHtml(embedCode)
                                                } else if (youtubeUrl) {
                                                    const width = (dialog.getValueOf('tab-youtube', 'ytWidth') as string) || '640'
                                                    const height = (dialog.getValueOf('tab-youtube', 'ytHeight') as string) || '360'
                                                    const align = dialog.getValueOf('tab-youtube', 'ytAlign') as string
                                                    const responsive = dialog.getValueOf('tab-youtube', 'ytResponsive') as boolean
                                                    const controls = (dialog.getValueOf('tab-youtube', 'ytControls') as boolean) ? '1' : '0'
                                                    const autoplay = (dialog.getValueOf('tab-youtube', 'ytAutoplay') as boolean) ? '1' : '0'
                                                    const showSuggested = (dialog.getValueOf('tab-youtube', 'showSuggested') as boolean) ? '1' : '0'

                                                    let videoId = ''
                                                    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
                                                    const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/
                                                    
                                                    const ytMatch = youtubeUrl.match(ytRegex)
                                                    const vimeoMatch = youtubeUrl.match(vimeoRegex)

                                                    let embedUrl = ''
                                                    if (ytMatch && ytMatch[1]) {
                                                        videoId = ytMatch[1]
                                                        embedUrl = `https://www.youtube.com/embed/${videoId}?controls=${controls}&autoplay=${autoplay}&rel=${showSuggested}`
                                                    } else if (vimeoMatch && vimeoMatch[3]) {
                                                        videoId = vimeoMatch[3]
                                                        embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay}`
                                                    } else {
                                                        alert('Invalid YouTube or Vimeo URL')
                                                        return false
                                                    }

                                                    let containerStyle = ''
                                                    if (align === 'center') {
                                                        containerStyle = 'display: block; margin: 0 auto;'
                                                    } else if (align === 'left') {
                                                        containerStyle = 'display: inline-block; margin-right: 15px;'
                                                    } else if (align === 'right') {
                                                        containerStyle = 'display: inline-block; margin-left: 15px;'
                                                    } else {
                                                        containerStyle = 'display: inline-block;'
                                                    }

                                                    const iframeStyle = responsive
                                                        ? 'max-width: 100%; height: auto; aspect-ratio: 16/9;'
                                                        : `width: ${width}px; height: ${height}px;`

                                                    const iframeHtml = `<div class="video-widget" data-align="${align}" style="${containerStyle}"><iframe src="${embedUrl}" style="${iframeStyle}" frameborder="0" allowfullscreen></iframe></div>`

                                                    editor.insertHtml(iframeHtml)
                                                } else {
                                                    alert('Please enter embed code or video URL')
                                                    return false
                                                }
                                            }
                                        },
                                        onCancel: function (this: CKEditorDialog) {
                                            const fileInput = document.getElementById('videoFileInput') as HTMLInputElement | null
                                            if (fileInput) fileInput.value = ''
                                            
                                            const uploadProgress = document.getElementById('uploadProgress')
                                            if (uploadProgress) uploadProgress.style.display = 'none'
                                        }
                                    }
                                })

                                // Video button
                                editor.ui.addButton('CustomVideo', {
                                    label: 'Insert Video',
                                    command: 'openVideoDialog',
                                    toolbar: 'insert',
                                    
                                    icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
                                })

                                // Command
                                editor.addCommand('openVideoDialog', new CKEDITOR.dialogCommand('videoDialog'))
                            },
                        })
                    }
                }}
                initData={content}
                onChange={(event: any) => {
                    const html = event.editor.getData()
                    onChange(html)
                }}
                editorUrl="https://cdn.ckeditor.com/4.22.1/full-all/ckeditor.js"
                config={{
                    height: 800,
                    style: {
                        width: '100%',
                        height: '100%',
                        maxHeight: '90vh',
                    },
                    extraPlugins: 'customvideo,image2,uploadimage,autogrow,justify,colorbutton,indentblock,codesnippet,iframe,widget,widgetselection,clipboard,pastefromword,find,showblocks,horizontalrule,table,tableresize,tabletools,specialchar,smiley,preview,print,contextmenu,tableselection',

                    autoGrow_onStartup: true,
                    autoGrow_minHeight: 400,
                    autoGrow_maxHeight: 900,
                    removePlugins: 'resize',

                    uploadUrl: 'http://localhost:5000/api/fm/upload',
                    filebrowserUploadUrl: 'http://localhost:5000/api/fm/upload',
                    filebrowserImageUploadUrl: 'http://localhost:5000/api/fm/upload',

                    filebrowserBrowseUrl: '/dashboards/files?mode=picker&type=file',
                    filebrowserImageBrowseUrl: '/dashboards/files?mode=picker&type=image',

                    removeDialogTabs: 'image:advanced;link:advanced',

                    codeSnippet_theme: 'monokai_sublime',

                    allowedContent: true,

                    toolbarGroups: [
                        // { name: 'document', groups: ['mode', 'document', 'doctools'] },
                        // { name: 'clipboard', groups: ['clipboard', 'undo'] },
                        // { name: 'editing', groups: ['find', 'selection'] },
                        { name: 'basicstyles', groups: ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'removeformat'] },
                        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
                        { name: 'links' },
                        { name: 'insert' },
                        { name: 'styles' },
                        { name: 'colors' },
                        { name: 'tools' },
                    ],

                }}
            />
        </>
    )
}

export default RichTextEditor4