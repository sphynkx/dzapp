import { initializeEditorButtons } from './replyHandler.js';

export function renderComments(comments, container) {
    comments.forEach(comment => {
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
                    <button type="button" class="strong-btn">Strong</button>
                    <button type="button" class="italic-btn">Italic</button>
                    <button type="button" class="code-btn">Code</button>
                    <button type="button" class="link-btn">Link</button>
                </div>
                <div class="editor" contenteditable="true" placeholder="Write your comment here"></div>
                <textarea name="content" hidden required></textarea>
                <div class="form-group">
                    <button type="submit" title="Childe">Send</button>
                </div>
            </form>
            <div class="comments"></div>
        `;
        container.appendChild(commentElement);
        renderComments(comment.children, commentElement.querySelector('.comments'));

        initializeEditorButtons();
    });
}
