import { addReplyHandlers, initializeEditorButtons } from './replyHandler.js';

export function submitFormHandler(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('input[name="email"]');

    if (!validateEmail(emailInput.value)) {
        alert('Please enter a valid email address.');
        emailInput.focus();
        return;
    }

    const formData = new FormData(form);

    console.log("Form data before submit:", Array.from(formData.entries()));

    // Current active post
    const postElement = form.closest('.msg-output');
    localStorage.setItem('openPost', postElement.dataset.id);

    fetch(addCommentURL, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken
        },
        body: new URLSearchParams(formData).toString()
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            console.error(data.error);
            return;
        }
        if (data.parent_id) {
            console.log('Received data:', data);

            let parentComment = document.querySelector(`.comment[data-id="${data.parent_id}"]`);
            if (!parentComment) {
                // If parentComment is not found, it may be a post ID
                parentComment = document.querySelector(`.msg-output[data-id="${data.parent_id}"]`);
            }
            console.log('Parent comment or post:', parentComment);

            if (parentComment) {
                const commentsContainer = parentComment.querySelector('.comments');
                console.log('Comments container:', commentsContainer);

                if (commentsContainer) {
                    const comment = data.comment;

                    const commentElement = document.createElement('div');
                    commentElement.classList.add('comment');
                    commentElement.dataset.id = comment.id;
                    commentElement.innerHTML = `
                        <strong>${comment.user__username}</strong>
                        <a href="${comment.homepage}" target="_blank">🏠</a>
                        <a href="mailto:${comment.email}" target="_blank">✉️</a>
                        (${comment.published_date} ${comment.published_time.split('.')[0]}):
                        <div class="comment-content">
                            <p>${comment.content}</p>
                        </div>
                        <button class="reply-btn">Reply</button>
                        <form action="${addCommentURL}" method="post" class="comment-form hidden">
                            <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                            <input type="hidden" name="parent_id" value="${comment.id}">
                            <div class="form-group">
                                <input type="text" name="user_name" placeholder="Your Name" value="Anonymous" required>
                                <input type="email" name="email" placeholder="Email" required>
                                <input type="text" name="homepage" placeholder="Homepage">
                            </div>
                            <div class="toolbar">
                                <button type="button" class="strong-btn">B</button>
                                <button type="button" class="italic-btn">I</button>
                                <button type="button" class="code-btn">CODE</button>
                                <button type="button" class="link-btn">LINK</button>
                                <button type="button" class="img-btn">IMG</button>
                                <button type="button" class="txt-btn">TXT</button>
                            </div>
                            <input type="file" class="img-input" style="display: none;">
                            <input type="file" class="txt-input" style="display: none;">
                            <div class="editor" contenteditable="true" placeholder="Write your comment here"></div>
                            <textarea name="content" hidden required></textarea>
                            <div class="form-group">
                                <button type="submit" title="Childe2">Send</button>
                            </div>
                        </form>
                        <div class="comments"></div>
                    `;
                    commentsContainer.appendChild(commentElement);

                    form.reset();
                    form.classList.add('hidden');
                    clearEditor(form);

                    addReplyHandlers(); // Reply buttons for root posts
                    initializeEditorButtons();
                    applyStyles(commentElement); // bugfix for unapplied styles
                } else {
                    console.error('Comments container not found');
                }
            } else {
                console.error('Parent comment or post not found');
            }
        } else {
            form.reset();
        }

        // Reopen active post
        const openPostId = localStorage.getItem('openPost');
        if (openPostId) {
            const openPostElement = document.querySelector(`.msg-output[data-id="${openPostId}"]`);
            if (openPostElement) {
                openPostElement.classList.add('active');
                localStorage.removeItem('openPost');
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function clearEditor(form) {
    const editorDiv = form.querySelector('.editor');
    editorDiv.innerHTML = '';
}

function applyStyles(commentElement) {
    // Bugfix - styles didn't apply immediately after comment creation
    commentElement.querySelectorAll('img').forEach(img => img.classList.add('comment-content'));
    commentElement.querySelectorAll('pre').forEach(pre => pre.classList.add('comment-content'));
}
