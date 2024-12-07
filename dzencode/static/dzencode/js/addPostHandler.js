import { addReplyHandlers } from './replyHandler.js';

document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.querySelector('#post-form-container form');
    postForm.addEventListener('submit', handleAddPostFormSubmit);

    document.querySelectorAll('.msg-item h3 a').forEach(link => {
        link.addEventListener('click', handlePostToggle);
    });
    console.log('Initial event listeners attached to existing posts.');
});

function handleAddPostFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': form.querySelector('[name="csrfmiddlewaretoken"]').value
        },
        body: new URLSearchParams(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error from server:', data.error);
        } else {
            console.log('Post created successfully:', data);
            appendNewPostToPage(data);
            document.getElementById('post-form-container').style.display = 'none';
            clearAddPostForm();
            //Reload page. Freshly created post didnt expand correctly. Only after page reload.
            setTimeout(() => {
                window.location.reload();
            }, 4);
        }
    })
    .catch(error => console.error('Error submitting post form:', error));
}

function appendNewPostToPage(post) {
    const postContainer = document.querySelector('.msg-all');
    const postElement = document.createElement('div');
    postElement.classList.add('msg-item');
    postElement.innerHTML = `
        <h3>
            <a href="#" name="${post.title}">${post.title}</a>
            <span class="msg-aftertitle">by <strong>${post.user_name}</strong> (${post.date} at ${post.time})</span>
        </h3>
        <div class="msg-output" data-id="${post.id}" style="border: 1px solid green; max-height:400px; width:90%; overflow-x:hidden; overflow-y: auto; margin-left:50px;">
            <span class="msg-user" title="${post.user_name}"></span>
            <span class="msg-date-time"></span>
            <div class="msg-content"></div>
            <button class="reply-btn">Reply</button>
            <div class="comments"></div>
        </div>
    `;
    postContainer.prepend(postElement);

    addReplyHandlers();

    postElement.querySelector('h3 a').addEventListener('click', handlePostToggle);
    console.log('Event listener attached to new post:', post.title);
}

function clearAddPostForm() {
    const postForm = document.querySelector('#post-form-container form');
    postForm.reset();
}

function handlePostToggle(event) {
    event.preventDefault();
    const currentPost = event.target.closest('h3').nextElementSibling;

    console.log('Post clicked:', currentPost);
    console.log('Current classes:', currentPost.className);

    // Toggle click to post
    if (currentPost.classList.contains('active')) {
        console.log('Closing post:', currentPost.dataset.id);
        currentPost.classList.remove('active');
        console.log('Classes after closing:', currentPost.className);
    } else {
        console.log('Opening post:', currentPost.dataset.id);
        document.querySelectorAll('.msg-output').forEach(function(post) {
            if (post !== currentPost) {
                post.classList.remove('active');
                console.log('Classes after removing active:', post.className);
            }
        });
        //currentPost.classList.add('active'); //conflicts with same one from fetchData.js
        console.log('Classes after opening:', currentPost.className);
    }
}
