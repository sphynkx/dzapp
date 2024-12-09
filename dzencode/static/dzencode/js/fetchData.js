import { renderComments } from './renderComments.js';
import { addReplyHandlers } from './replyHandler.js';

export function fetchData(event) {
    const postId = event.target.dataset.id;
    const cur_post = event.target.closest('h3').nextElementSibling;

    // Toggle click to post
    if (cur_post.classList.contains('active')) {
        cur_post.classList.remove('active');
        cur_post.querySelector('.msg-content').innerText = '';
        cur_post.querySelector('.msg-user').innerText = '';
        cur_post.querySelector('.msg-date-time').innerText = '';
        cur_post.querySelector('.comments').innerHTML = '';
        return;
    }

    // Clean all fields
    document.querySelectorAll('.msg-output').forEach(function(cur_post) {
        cur_post.classList.remove('active');
        cur_post.querySelector('.msg-content').innerText = '';
        cur_post.querySelector('.msg-user').innerText = '';
        cur_post.querySelector('.msg-date-time').innerText = '';
        cur_post.querySelector('.comments').innerHTML = '';
    });

    fetch(`/api/posts/${postId}/`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
            return;
        }
        cur_post.classList.add('active');
        cur_post.querySelector('.msg-content').innerText = data.message;
        cur_post.querySelector('.msg-user').innerText = data.user_name;
        cur_post.querySelector('.msg-date-time').innerText = `(${data.date} ${data.time.split('.')[0]})`;

        const commentsContainer = cur_post.querySelector('.comments');
        renderComments(data.comments || [], commentsContainer);
        addReplyHandlers(); // Reply buttons for root posts
    })
    .catch(error => console.error('Error:', error));
}
