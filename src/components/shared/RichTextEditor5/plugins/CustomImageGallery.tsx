import { Plugin, ButtonView, Widget, toWidget } from 'ckeditor5'

export default class CustomImageGallery extends Plugin {
    static get requires() {
        return [Widget]
    }

    init() {
        const editor = this.editor

        // 1. Tugma yaratish
        editor.ui.componentFactory.add('customImageGallery', () => {
            const button = new ButtonView()

            button.set({
                label: 'Add Image Gallery',
                tooltip: true,
                withText: false,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>`,
            })

            button.on('execute', () => {
                this.openFileManager(editor)
            })

            return button
        })

        // 2. Model (Schema) - Widget support + Alignment
        editor.model.schema.register('imageGallery', {
            inheritAllFrom: '$blockObject',
            allowAttributes: ['data-images', 'data-slides', 'alignment'],
            isObject: true,
            isSelectable: true,
            isContent: true,
        })

        // Alignment support
        editor.model.schema.setAttributeProperties('alignment', {
            isFormatting: true,
        })

        // 3. EDITING VIEW - alignment bilan
        editor.conversion.for('editingDowncast').elementToElement({
            model: 'imageGallery',
            view: (modelElement: any, { writer }) => {
                const images = JSON.parse(
                    modelElement.getAttribute('data-images') || '[]',
                )
                const alignment =
                    modelElement.getAttribute('alignment') || 'left'

                // Alignment ga qarab style
                let alignStyle = 'text-align: left;'
                if (alignment === 'center') {
                    alignStyle = 'text-align: center;'
                } else if (alignment === 'right') {
                    alignStyle = 'text-align: right;'
                }

                const container = writer.createContainerElement('div', {
                    class: 'image-gallery-editor',
                    style: `display: block; margin: 10px 0; ${alignStyle}`,
                })

                const innerWrapper = writer.createRawElement(
                    'div',
                    {
                        style: 'display: inline-block; border: 2px solid transparent; padding: 10px; background: #f9fafb; border-radius: 8px; transition: border-color 0.2s;',
                    },
                    (domElement) => {
                        domElement.innerHTML = `
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${images
                                    .map(
                                        (url: string) =>
                                            `<img src="${url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;" />`,
                                    )
                                    .join('')}
                            </div>
                        `
                    },
                )

                writer.insert(
                    writer.createPositionAt(container, 0),
                    innerWrapper,
                )

                // WIDGET qilib qaytaramiz
                return toWidget(container, writer, { label: 'Image Gallery' })
            },
        })

        // 4. DATA VIEW - alignment bilan
        editor.conversion.for('dataDowncast').elementToElement({
            model: 'imageGallery',
            view: (modelElement, { writer }) => {
                const images = modelElement.getAttribute('data-images')
                const slides = modelElement.getAttribute('data-slides')
                const alignment =
                    modelElement.getAttribute('alignment') || 'left'

                return writer.createContainerElement('div', {
                    class: 'raw-image-gallery-widget',
                    'data-gallery-images': images,
                    'data-slides-count': slides,
                    'data-alignment': alignment,
                })
            },
        })

        // 5. UPCAST
        editor.conversion.for('upcast').elementToElement({
            view: {
                name: 'div',
                classes: 'raw-image-gallery-widget',
            },
            model: (viewElement, { writer }) => {
                const images =
                    viewElement.getAttribute('data-gallery-images') || '[]'
                const slides =
                    viewElement.getAttribute('data-slides-count') || '3'
                const alignment =
                    viewElement.getAttribute('data-alignment') || 'left'

                return writer.createElement('imageGallery', {
                    'data-images': images,
                    'data-slides': slides,
                    alignment: alignment,
                })
            },
        })

        // 6. ALIGNMENT attribute conversion - BU MUHIM!
        editor.conversion.for('downcast').add((dispatcher) => {
            dispatcher.on(
                'attribute:alignment:imageGallery',
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
                    let alignStyle = 'text-align: left;'
                    if (alignment === 'center') {
                        alignStyle = 'text-align: center;'
                    } else if (alignment === 'right') {
                        alignStyle = 'text-align: right;'
                    }

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
        const fileManagerUrl = '/dashboards/files?mode=picker&multi=true'
        const newWindow = window.open(
            fileManagerUrl,
            '_blank',
            'width=1200,height=700,left=100,top=100,resizable=yes,scrollbars=yes',
        )

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return

            let selectedImages: string[] = []

            if (event.data.type === 'IMAGES_SELECTED' && event.data.urls) {
                selectedImages = event.data.urls
            } else if (event.data.type === 'IMAGE_SELECTED' && event.data.url) {
                selectedImages = [event.data.url]
            }

            if (selectedImages.length > 0) {
                const slidesInput = window.prompt(
                    "Bitta qatorda nechta rasm ko'rinsin? (Masalan: 2, 3, 4)",
                    '3',
                )
                const slidesCount =
                    slidesInput && !isNaN(Number(slidesInput))
                        ? slidesInput
                        : '3'

                editor.model.change((writer: any) => {
                    // Galereya elementini yaratamiz
                    const galleryElement = writer.createElement(
                        'imageGallery',
                        {
                            'data-images': JSON.stringify(selectedImages),
                            'data-slides': slidesCount,
                            alignment: 'left', // Default alignment
                        },
                    )

                    // Galereyani qo'shamiz
                    editor.model.insertContent(
                        galleryElement,
                        editor.model.document.selection,
                    )

                    // Keyingi paragraf yaratamiz
                    const paragraph = writer.createElement('paragraph')
                    writer.insert(paragraph, galleryElement, 'after')

                    // Kursorni o'sha paragrafga o'tkazamiz
                    writer.setSelection(paragraph, 'in')
                })

                if (newWindow) newWindow.close()
                window.removeEventListener('message', handleMessage)
            }
        }

        window.addEventListener('message', handleMessage)
    }
}
