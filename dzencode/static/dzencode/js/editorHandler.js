export function strongButtonHandler() {
    const editorDiv = this.closest('form').querySelector('.editor');
    document.execCommand('bold', false, null);
    updateTextarea(editorDiv);
}

export function italicButtonHandler() {
    const editorDiv = this.closest('form').querySelector('.editor');
    document.execCommand('italic', false, null);
    updateTextarea(editorDiv);
}

export function codeButtonHandler() {
    const editorDiv = this.closest('form').querySelector('.editor');
    document.execCommand('insertHTML', false, `<code>${document.getSelection().toString()}</code>`);
    updateTextarea(editorDiv);
}

export function linkButtonHandler() {
    const editorDiv = this.closest('form').querySelector('.editor');
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (range && !range.collapsed) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <label for="url">Enter URL: </label>
                <input type="text" id="url" name="url">
                <div class="buttons">
                    <button type="button" class="url-cancel">Cancel</button>
                    <button type="button" class="url-submit" disabled>OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const insertButton = modal.querySelector('.url-submit');
        const cancelButton = modal.querySelector('.url-cancel');
        const urlInput = modal.querySelector('#url');

        urlInput.focus();

        urlInput.addEventListener('input', function() {
            const url = urlInput.value;
            insertButton.disabled = !validateURL(url);
        });

        urlInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !insertButton.disabled) {
                event.preventDefault();
                insertButton.click();
            }
        });

        urlInput.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                cancelButton.click();
            }
        });

        insertButton.addEventListener('click', function() {
            const url = urlInput.value;
            if (url) {
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.target = '_blank';
                anchor.appendChild(range.extractContents());
                range.insertNode(anchor);
                updateTextarea(editorDiv);
                document.body.removeChild(modal);
            }
        });

        cancelButton.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
    } else {
        alert('Please select the text you want to turn into a link.');
    }
}

function validateURL(url) {
    const invalidPatterns = ['<', '>', '&lt;', '&gt;', "'", '&#39;', '"', '&quot;', '../../', '/../'];
    for (const pattern of invalidPatterns) {
        if (url.includes(pattern)) {
            return false;
        }
    }
    if (!(url.startsWith('http:') || url.startsWith('https:'))) {
        return false;
    }
    return true;
}

export function imgButtonHandler() {
    const imgInput = this.closest('form').querySelector('.img-input');
    imgInput.click();
}

export function txtButtonHandler() {
    const txtInput = this.closest('form').querySelector('.txt-input');
    txtInput.click();
}

export function imgInputChangeHandler(event) {
    const file = event.target.files[0];
    if (file && isValidImageType(file.type)) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxWidth = 320;
                const maxHeight = 240;

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const dataURL = canvas.toDataURL('image/png');
                const editorDiv = event.target.closest('form').querySelector('.editor');
                document.execCommand('insertImage', false, dataURL);
                updateTextarea(editorDiv);
            };
        };
        reader.readAsDataURL(file);
    } else {
        alert('Invalid image type. Please select a JPG, GIF, or PNG image.');
    }
}

export function txtInputChangeHandler(event) {
    const file = event.target.files[0];
    if (file && isValidTextType(file.type) && file.size <= 100 * 1024) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const textContent = e.target.result;
            const editorDiv = event.target.closest('form').querySelector('.editor');
            const marker = '<!-- END_PRE_TAG -->';
            document.execCommand('insertHTML', false, `<br><pre>${textContent}</pre><br>${marker}`);
            const range = document.createRange();
            const markerNode = editorDiv.querySelector('pre').nextSibling;
            range.setStartAfter(markerNode);
            range.collapse(true);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            updateTextarea(editorDiv);
        };
        reader.readAsText(file);
    } else {
        alert('Invalid text file type or file is too large. Please select a TXT file under 100KB.');
    }
}

function isValidImageType(type) {
    return ['image/jpeg', 'image/gif', 'image/png'].includes(type);
}

function isValidTextType(type) {
    return type === 'text/plain';
}

export function updateTextarea(editorDiv) {
    let content = editorDiv.innerHTML;
    const marker = '<!-- END_PRE_TAG -->';
    if (content.includes(marker)) {
        content = content.replace(marker, '');
    }
    const textarea = editorDiv.closest('form').querySelector('textarea');
    textarea.value = content;
}
