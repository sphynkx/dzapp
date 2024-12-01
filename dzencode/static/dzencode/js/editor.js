document.addEventListener("DOMContentLoaded", function() {
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

    function updateTextarea(editorDiv) {
        const textarea = editorDiv.closest('form').querySelector('textarea');
        textarea.value = editorDiv.innerHTML;
    }

    document.querySelectorAll('.strong-btn').forEach(function(button) {
        button.addEventListener('click', strongButtonHandler);
    });
    document.querySelectorAll('.italic-btn').forEach(function(button) {
        button.addEventListener('click', italicButtonHandler);
    });
    document.querySelectorAll('.code-btn').forEach(function(button) {
        button.addEventListener('click', codeButtonHandler);
    });
    document.querySelectorAll('.link-btn').forEach(function(button) {
        button.addEventListener('click', linkButtonHandler);
    });

    window.initializeEditorButtons = function() {
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

        document.querySelectorAll('.editor').forEach(function(editorDiv) {
            editorDiv.removeEventListener('input', function() {
                updateTextarea(editorDiv);
            });
            editorDiv.addEventListener('input', function() {
                updateTextarea(editorDiv);
            });
        });
    };

    initializeEditorButtons();
});
