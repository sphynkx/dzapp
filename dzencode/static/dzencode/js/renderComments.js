import { addReplyHandlers, initializeEditorButtons } from './replyHandler.js';

async function generateCaptcha() {
    try {
        const response = await fetch('/generate_captcha/');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating captcha:', error);
        return null;
    }
}

export async function renderComments(comments, container) {
    for (const comment of comments) {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.dataset.id = comment.id;
        console.log('Rendering comment:', comment.id, comment);

        const captchaData = await generateCaptcha();
        console.log('Captcha Data:', captchaData);

        if (!captchaData || !captchaData.captcha_image_url) {
            console.error('Captcha data is empty or captcha image URL is missing!');
            return;
        }

        commentElement.innerHTML = `
            <strong>${comment.user__username || 'Anonymous'}</strong>
            <a href="${comment.homepage || '#'}" target="_blank">🏠</a>
            <a href="mailto:${comment.email || '#'}" target="_blank">✉️</a>
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
                    <img src="${captchaData.captcha_image_url}" alt="Captcha Image" class="captcha-image">
                    <input type="text" name="captcha" class="captcha" required placeholder="Enter Captcha">
                    <span class="captcha-value ${showCaptchaText === 'false' ? 'hidden-captcha-value' : ''}">${captchaData.captcha_value}</span>
                </div>
                <div class="form-group">
                    <button type="submit" title="Child">Send</button>
                </div>
            </form>
            <div class="comments"></div>
        `;
        container.appendChild(commentElement);

        if (comment.children && comment.children.length > 0) {
            const childrenContainer = commentElement.querySelector('.comments');
            renderComments(comment.children, childrenContainer);
        }

        initializeEditorButtons();
        addReplyHandlers();
    }
}
