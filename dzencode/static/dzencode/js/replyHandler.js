import { submitFormHandler } from './submitFormHandler.js';

export function addReplyHandlers() {
    document.querySelectorAll('.reply-btn').forEach(function(button) {
        button.removeEventListener('click', replyHandler);
        button.addEventListener('click', replyHandler);
    });
    document.querySelectorAll('.comment-form').forEach(function(form) {
        form.removeEventListener('submit', submitFormHandler);
        form.addEventListener('submit', submitFormHandler);
    });
    initializeEditorButtons();
}

export function initializeEditorButtons() {
    document.querySelectorAll('.strong-btn').forEach(function(button) {
        button.removeEventListener('click', strongButtonHandler);
        button.addEventListener('click', strongButtonHandler);
    });
    document.querySelectorAll('.italic-btn').forEach(function(button) {
        button.removeEventListener('click', italicButtonHandler);
        button.addEventListener('click', italicButtonHandler);
    });
    document.querySelectorAll('.code-btn').forEach(function(button) {
        button.removeEventListener('click', codeButtonHandler);
        button.addEventListener('click', codeButtonHandler);
    });
    document.querySelectorAll('.link-btn').forEach(function(button) {
        button.removeEventListener('click', linkButtonHandler);
        button.addEventListener('click', linkButtonHandler);
    });
    document.querySelectorAll('.img-btn').forEach(function(button) {
        button.removeEventListener('click', imgButtonHandler);
        button.addEventListener('click', imgButtonHandler);
    });

    document.querySelectorAll('.img-input').forEach(function(input) {
        input.removeEventListener('change', imgInputChangeHandler);
        input.addEventListener('change', imgInputChangeHandler);
    });

    document.querySelectorAll('.editor').forEach(function(editorDiv) {
        editorDiv.removeEventListener('input', function() {
            updateTextarea(editorDiv);
        });
        editorDiv.addEventListener('input', function() {
            updateTextarea(editorDiv);
        });
    });
}

function replyHandler(event) {
    event.preventDefault();
    console.log('Reply button clicked');
    document.querySelectorAll('.comment-form').forEach(function(form) {
        form.classList.add('hidden');
        form.reset();
    });
    const commentForm = event.target.nextElementSibling;
    commentForm.classList.toggle('hidden');
}

function strongButtonHandler() {
    const editorDiv = this.closest('form').querySelector('.editor');
    document.execCommand('bold', false, null);
    updateTextarea(editorDiv);
}

function italicButtonHandler() {
    const editorDiv = this.closest('form').querySelector('.editor');
    document.execCommand('italic', false, null);
    updateTextarea(editorDiv);
}

function codeButtonHandler() {
    const editorDiv = this.closest('form').querySelector('.editor');
    document.execCommand('insertHTML', false, `<code>${document.getSelection().toString()}</code>`);
    updateTextarea(editorDiv);
}

function linkButtonHandler() {
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

function imgButtonHandler() {
    const imgInput = this.closest('form').querySelector('.img-input');
    imgInput.click();
}

function imgInputChangeHandler(event) {
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

                const dataURL = canvas.toDataURL('image/png'); // Или другой формат, если нужно
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

function isValidImageType(type) {
    return ['image/jpeg', 'image/gif', 'image/png'].includes(type);
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

function updateTextarea(editorDiv) {
    const textarea = editorDiv.closest('form').querySelector('textarea');
    textarea.value = editorDiv.innerHTML;
}
