document.addEventListener("DOMContentLoaded", function() {
    function addReplyHandlers() {
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

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    function submitFormHandler(event) {
        event.preventDefault();
        const form = event.target;
        const emailInput = form.querySelector('input[name="email"]');
        const submitButton = form.querySelector('button[type="submit"]');

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
                const parentComment = document.querySelector(`[data-id="${data.parent_id}"]`);
                const commentsContainer = parentComment.querySelector('.comments');
                const comment = data.comment;

                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');
                commentElement.dataset.id = comment.id;
                commentElement.innerHTML = `
                    <strong>${comment.user__username}</strong>
                    <a href="${comment.homepage}" target="_blank">🏠</a>
                    <a href="mailto:${comment.email}" target="_blank">✉️</a>
                    (${comment.published_date} ${comment.published_time.split('.')[0]}):
                    <p>${comment.content}</p>
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
                            <button type="submit" title="Childe2">Send</button>
                        </div>
                    </form>
                    <div class="comments"></div>
                `;
                commentsContainer.appendChild(commentElement);
                addReplyHandlers(); // Reply buttons for root posts

                initializeEditorButtons();

                form.classList.add('hidden');
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

    function fetchData(event) {
        const title = event.target.name;
        // clean all fields..
        document.querySelectorAll('.msg-output').forEach(function(cur_post) {
            cur_post.classList.remove('active');
            cur_post.querySelector('.msg-content').innerText = '';
            cur_post.querySelector('.msg-user').innerText = '';
            cur_post.querySelector('.msg-date-time').innerText = '';
            cur_post.querySelector('.comments').innerHTML = '';
        });

        fetch(`/?title=${title}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
                return;
            }
            const cur_post = event.target.closest('h3').nextElementSibling;
            cur_post.classList.add('active');
            cur_post.querySelector('.msg-content').innerText = data.message;
            cur_post.querySelector('.msg-user').innerText = data.user_name;
            cur_post.querySelector('.msg-date-time').innerText = `(${data.date} ${data.time.split('.')[0]})`;

            const commentsContainer = cur_post.querySelector('.comments');
            function renderComments(comments, container) {
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

            renderComments(data.comments, commentsContainer);
            addReplyHandlers(); // Reply buttons for root posts
        })
        .catch(error => console.error('Error:', error));
    }

    document.querySelectorAll('a').forEach(function(element) {
        element.addEventListener('click', function(event) {
            event.preventDefault();
            fetchData(event);
        });
    });

    addReplyHandlers(); // Reply buttons for comments
});
