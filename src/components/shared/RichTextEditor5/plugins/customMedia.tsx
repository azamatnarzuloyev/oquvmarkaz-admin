import { Plugin, ButtonView, Widget, toWidget } from 'ckeditor5'

export default class CustomMedia extends Plugin {
    static get requires() {
        return [Widget]
    }

    init() {
        const editor = this.editor

        // Media button
        editor.ui.componentFactory.add('customMedia', () => {
            const button = new ButtonView()

            button.set({
                label: 'Media upload',
                tooltip: true,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g fill="#000"><path d="M20.535 3.464C19.07 2 16.713 2 11.999 2 7.285 2 4.93 2 3.464 3.464c-.758.758-1.123 1.754-1.3 3.192a6.5 6.5 0 0 1 1.884-1.448c.782-.398 1.619-.56 2.545-.635C7.488 4.5 8.59 4.5 9.936 4.5h4.126c1.347 0 2.448 0 3.343.073.927.076 1.764.237 2.545.635a6.499 6.499 0 0 1 1.884 1.448c-.176-1.438-.542-2.434-1.3-3.192z" fill="#000000" opacity="1" data-original="#000000"></path><path fill-rule="evenodd" d="M2 14c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 6.545C5.8 6 7.2 6 10 6h4c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C22 9.8 22 11.2 22 14s0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C18.2 22 16.8 22 14 22h-4c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 18.2 2 16.8 2 14zm10.53-3.53a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 1 0 1.06 1.06l1.22-1.22V17a.75.75 0 0 0 1.5 0v-4.19l1.22 1.22a.75.75 0 1 0 1.06-1.06z" clip-rule="evenodd" fill="#000000" opacity="1" data-original="#000000"></path></g></g></svg>`,
            })

            button.on('execute', () => {
                this.openFileManager(editor)
            })

            return button
        })

        // Define video schema - Widget support + Alignment
        editor.model.schema.register('customVideo', {
            inheritAllFrom: '$blockObject',
            allowAttributes: [
                'src',
                'width',
                'height',
                'controls',
                'style',
                'alignment',
            ],
            isObject: true,
            isSelectable: true,
            isContent: true,
        })

        // Alignment support
        editor.model.schema.setAttributeProperties('alignment', {
            isFormatting: true,
        })

        // Conversion for editing downcast - alignment bilan
        editor.conversion.for('editingDowncast').elementToElement({
            model: 'customVideo',
            view: (modelElement, { writer }) => {
                const src = modelElement.getAttribute('src')
                const width = modelElement.getAttribute('width') || '100%'
                const height = modelElement.getAttribute('height') || 'auto'
                const alignment =
                    modelElement.getAttribute('alignment') || 'left'

                // Alignment ga qarab style
                let alignStyle = 'text-align: left;'
                if (alignment === 'center') {
                    alignStyle = 'text-align: center;'
                } else if (alignment === 'right') {
                    alignStyle = 'text-align: right;'
                }

                const figure = writer.createContainerElement('figure', {
                    class: 'media',
                    style: `display: block; margin: 10px 0; ${alignStyle}`,
                })

                const video = writer.createRawElement(
                    'video',
                    {
                        src,
                        controls: 'controls',
                        style: `width: ${width}; height: ${height}; max-width: 100%; border: 2px solid transparent; transition: border-color 0.2s; display: inline-block;`,
                    },
                    (domElement) => {
                        domElement.innerHTML = `<source src="${src}" type="video/mp4">`
                    },
                )

                writer.insert(writer.createPositionAt(figure, 0), video)

                // WIDGET qilib qaytaramiz
                return toWidget(figure, writer, { label: 'Video' })
            },
        })

        // Conversion for data downcast - alignment bilan
        editor.conversion.for('dataDowncast').elementToElement({
            model: 'customVideo',
            view: (modelElement, { writer }) => {
                const src = modelElement.getAttribute('src')
                const width = modelElement.getAttribute('width') || '100%'
                const height = modelElement.getAttribute('height') || 'auto'
                const alignment =
                    modelElement.getAttribute('alignment') || 'left'

                const figure = writer.createContainerElement('figure', {
                    class: 'media',
                    'data-alignment': alignment,
                })

                const video = writer.createRawElement(
                    'video',
                    {
                        src,
                        controls: 'controls',
                        style: `width: ${width}; height: ${height}; max-width: 100%;`,
                    },
                    (domElement) => {
                        domElement.innerHTML = `<source src="${src}" type="video/mp4">`
                    },
                )

                writer.insert(writer.createPositionAt(figure, 0), video)

                return figure
            },
        })

        // Conversion for upcast
        editor.conversion.for('upcast').elementToElement({
            view: {
                name: 'figure',
                classes: 'media',
            },
            model: (viewElement, { writer }) => {
                const videoElement: any = viewElement.getChild(0)

                if (!videoElement || videoElement.name !== 'video') {
                    return null
                }

                const src = videoElement.getAttribute('src')
                const alignment =
                    viewElement.getAttribute('data-alignment') || 'left'

                return writer.createElement('customVideo', {
                    src,
                    width: '100%',
                    height: 'auto',
                    controls: 'controls',
                    alignment: alignment,
                })
            },
        })

        // Fallback upcast
        editor.conversion.for('upcast').elementToElement({
            view: {
                name: 'video',
            },
            model: (viewElement, { writer }) => {
                const src = viewElement.getAttribute('src')

                return writer.createElement('customVideo', {
                    src,
                    width: '100%',
                    height: 'auto',
                    controls: 'controls',
                    alignment: 'left',
                })
            },
        })

        // ALIGNMENT attribute conversion - BU MUHIM!
        editor.conversion.for('downcast').add((dispatcher) => {
            dispatcher.on(
                'attribute:alignment:customVideo',
                (evt, data, conversionApi) => {
                    if (
                        !conversionApi.consumable.consume(data.item, evt.name)
                    ) {
                        return
                    }

                    const viewElement = conversionApi.mapper.toViewElement(
                        data.item,
                    )

                    if (!viewElement) return

                    const viewWriter = conversionApi.writer
                    const alignment = data.attributeNewValue || 'left'

                    // Style ni yangilash
                    viewWriter.setStyle('text-align', alignment, viewElement)
                },
            )
        })

        editor.conversion.for('upcast').attributeToAttribute({
            view: {
                key: 'data-alignment',
            },
            model: 'alignment',
        })
    }

    openFileManager(editor: any) {
        const fileManagerUrl = '/dashboards/files?mode=picker'

        const width = 1000
        const height = 600
        const left = (window.screen.width - width) / 2
        const top = (window.screen.height - height) / 2

        const newWindow = window.open(
            fileManagerUrl,
            '_blank',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
        )

        if (!newWindow) {
            alert('Popup bloklangan! Brauzer sozlamalarida ruxsat bering.')
            return
        }

        let checkClosedInterval: any = null

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return
            }

            // Handle Image
            if (event.data.type === 'IMAGE_SELECTED' && event.data.url) {
                const imageUrl = event.data.url

                editor.model.change((writer: any) => {
                    const imageElement = writer.createElement('imageBlock', {
                        src: imageUrl,
                    })

                    editor.model.insertContent(
                        imageElement,
                        editor.model.document.selection,
                    )

                    // Keyingi paragraf yaratish
                    const paragraph = writer.createElement('paragraph')
                    writer.insert(paragraph, imageElement, 'after')
                    writer.setSelection(paragraph, 'in')
                })

                this.closeAndCleanup(
                    newWindow,
                    handleMessage,
                    checkClosedInterval,
                )
            }

            // Handle Video
            if (event.data.type === 'VIDEO_SELECTED' && event.data.url) {
                const {
                    url,
                    width: videoWidth,
                    height: videoHeight,
                } = event.data

                editor.model.change((writer: any) => {
                    const videoElement = writer.createElement('customVideo', {
                        src: url,
                        width: videoWidth ? `${videoWidth}px` : '100%',
                        height: videoHeight ? `${videoHeight}px` : 'auto',
                        controls: 'controls',
                        alignment: 'left', // Default alignment
                    })

                    editor.model.insertContent(
                        videoElement,
                        editor.model.document.selection,
                    )

                    // Keyingi paragraf yaratish
                    const paragraph = writer.createElement('paragraph')
                    writer.insert(paragraph, videoElement, 'after')
                    writer.setSelection(paragraph, 'in')
                })

                this.closeAndCleanup(
                    newWindow,
                    handleMessage,
                    checkClosedInterval,
                )
            }
        }

        window.addEventListener('message', handleMessage)

        checkClosedInterval = setInterval(() => {
            if (newWindow && newWindow.closed) {
                window.removeEventListener('message', handleMessage)
                clearInterval(checkClosedInterval)
            }
        }, 500)
    }

    closeAndCleanup(
        newWindow: Window | null,
        handleMessage: any,
        interval: any,
    ) {
        if (newWindow && !newWindow.closed) {
            newWindow.close()
        }
        window.removeEventListener('message', handleMessage)
        if (interval) {
            clearInterval(interval)
        }
    }
}
