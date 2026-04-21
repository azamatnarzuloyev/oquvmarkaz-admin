import { Plugin, ButtonView } from 'ckeditor5'

export default class CustomMediaEmbed extends Plugin {
    init() {
        const editor = this.editor

        // Override default mediaEmbed button
        editor.ui.componentFactory.add('mediaEmbed', () => {
            const button = new ButtonView()

            button.set({
                label: 'Insert media',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M492.7 127.1c-12-7.9-27.2-9.3-40.5-3.5l-.7.3-74.2 37.3v-43.5c0-23.6-19.2-42.7-42.8-42.8H42.8C19.2 74.9 0 94 0 117.7v276.7c0 23.6 19.2 42.7 42.8 42.8h291.8c23.6 0 42.7-19.2 42.8-42.8v-43.5l74.2 37.3.7.3c21.7 9.4 46.9-.6 56.2-22.3 2.3-5.4 3.5-11.2 3.5-17V162.9c0-14.4-7.2-27.9-19.3-35.8zm-248.3 158-77.8 45.1c-16 9.3-36.6 3.8-45.9-12.2-3-5.1-4.5-10.9-4.5-16.9v-90.3c0-18.6 15.1-33.6 33.6-33.5 5.9 0 11.7 1.6 16.8 4.5l77.8 45.1c16 9.3 21.5 29.9 12.2 45.9-2.9 5.2-7.1 9.4-12.2 12.3z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>`,
                tooltip: true,
            })

            button.on('execute', () => {
                this.openMediaModal(editor)
            })

            return button
        })
    }

    openMediaModal(editor: any) {
        // Create modal overlay
        const overlay = document.createElement('div')
        overlay.className = 'ckeditor-media-modal-overlay'
        overlay.innerHTML = `
            <div class="ckeditor-media-modal">
                <div class="modal-header">
                    <h3>Insert Media</h3>
                    <button class="close-btn" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Media URL</label>
                        <input type="text" id="media-url" class="form-control" placeholder="Enter YouTube, Vimeo, or video URL">
                        <small>Supports: YouTube, Vimeo, Dailymotion, Spotify, or direct video links</small>
                    </div>
                    
                    <div class="dimensions-group">
                        <div class="form-group">
                            <label>Width</label>
                            <input type="text" id="media-width" class="form-control" placeholder="520" value="520">
                        </div>
                        <div class="form-group">
                            <label>Height</label>
                            <input type="text" id="media-height" class="form-control" placeholder="320" value="320">
                        </div>
                    </div>

                    <div class="preview-section" id="preview-section" style="display: none;">
                        <label>Preview</label>
                        <div  id="media-preview"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                    <button type="button" class="btn btn-primary insert-btn">Insert</button>
                </div>
            </div>
        `

        document.body.appendChild(overlay)

        // Get elements
        const modal = overlay.querySelector('.ckeditor-media-modal')
        const closeBtn = overlay.querySelector('.close-btn')
        const cancelBtn = overlay.querySelector('.cancel-btn')
        const insertBtn = overlay.querySelector('.insert-btn')
        const urlInput = overlay.querySelector('#media-url') as HTMLInputElement
        const widthInput = overlay.querySelector(
            '#media-width',
        ) as HTMLInputElement
        const heightInput = overlay.querySelector(
            '#media-height',
        ) as HTMLInputElement
        const previewSection = overlay.querySelector(
            '#preview-section',
        ) as HTMLElement
        const previewDiv = overlay.querySelector(
            '#media-preview',
        ) as HTMLElement

        // Preview functionality
        let previewTimeout: any
        urlInput.addEventListener('input', () => {
            clearTimeout(previewTimeout)
            previewTimeout = setTimeout(() => {
                const url = urlInput.value.trim()
                if (url) {
                    const html = this.generateMediaHtml(
                        url,
                        widthInput.value,
                        heightInput.value,
                    )
                    if (html) {
                        previewSection.style.display = 'block'
                        previewDiv.innerHTML = html
                    }
                } else {
                    previewSection.style.display = 'none'
                }
            }, 500)
        })

        // Close handlers
        const closeModal = () => {
            document.body.removeChild(overlay)
        }

        closeBtn?.addEventListener('click', closeModal)
        cancelBtn?.addEventListener('click', closeModal)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal()
        })

        // Insert handler
        insertBtn?.addEventListener('click', () => {
            const url = urlInput.value.trim()
            const width = widthInput.value.trim() || '640'
            const height = heightInput.value.trim() || '360'

            if (!url) {
                alert('Please enter a media URL')
                return
            }

            const html = this.generateMediaHtml(url, width, height)

            if (html) {
                const viewFragment = editor.data.processor.toView(html)
                const modelFragment = editor.data.toModel(viewFragment)

                editor.model.change((writer: any) => {
                    editor.model.insertContent(
                        modelFragment,
                        editor.model.document.selection,
                    )
                })

                closeModal()
            } else {
                alert('Invalid media URL. Please check and try again.')
            }
        })

        // Focus input
        setTimeout(() => urlInput.focus(), 100)
    }

    generateMediaHtml(url: string, width: string, height: string): string {
        // YouTube
        const youtubeMatch = url.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
        )
        if (youtubeMatch) {
            const videoId = youtubeMatch[1]
            return `
                    <iframe src="https://www.youtube.com/embed/${videoId}" 
                            width="${width}" 
                            height="${height}" 
                            style="object-fit: cover;"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
          `
        }

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
        if (vimeoMatch) {
            const videoId = vimeoMatch[1]
            return `
                    <iframe src="https://player.vimeo.com/video/${videoId}" 
                            width="${width}" 
                            height="${height}" 
                            style="object-fit: cover;"
                            frameborder="0" 
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                `
        }

        // Dailymotion
        const dailymotionMatch = url.match(/dailymotion\.com\/video\/([^_]+)/i)
        if (dailymotionMatch) {
            const videoId = dailymotionMatch[1]
            return `
                    <iframe src="https://www.dailymotion.com/embed/video/${videoId}" 
                            width="${width}" 
                            height="${height}" 
                            style="object-fit: cover;"
                            frameborder="0" 
                            allowfullscreen>
                    </iframe>
                `
        }

        // Spotify
        const spotifyMatch = url.match(
            /open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/i,
        )
        if (spotifyMatch) {
            const type = spotifyMatch[1]
            const id = spotifyMatch[2]
            return `
                <iframe src="https://open.spotify.com/embed/${type}/${id}" 
                        width="${width}" 
                        height="${height}" 
                        style="object-fit: cover;"
                        frameborder="0" 
                        allowtransparency="true" 
                        allow="encrypted-media">
                </iframe>
            `
        }

        // Direct video URL (mp4, webm, ogg)
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
            const videoWidth = width === 'auto' ? '640' : width
            const videoHeight = height === 'auto' ? '360' : height

            return `
                <figure class="media">
                    <video controls style="width: ${videoWidth}; height: ${videoHeight}; max-width: 100%;">
                        <source src="${url}" type="video/${url.split('.').pop()}">
                        Your browser does not support the video tag.
                    </video>
                </figure>
            `
        }

        return ''
    }
}
