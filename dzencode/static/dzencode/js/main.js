import { addReplyHandlers } from './replyHandler.js';
import { fetchData } from './fetchData.js';
import { submitFormHandler } from './submitFormHandler.js';

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('a').forEach(function(element) {
        element.addEventListener('click', function(event) {
            event.preventDefault();
            fetchData(event);
        });
    });

    document.getElementById('sort-title').addEventListener('click', function() {
        sortPosts('title');
    });

    document.getElementById('sort-author').addEventListener('click', function() {
        sortPosts('author');
    });

    document.getElementById('sort-datetime').addEventListener('click', function() {
        sortPosts('datetime');
    });

    addReplyHandlers(); // Reply buttons for comments
});

function sortPosts(criteria) {
    const posts = document.querySelectorAll('.msg-item');
    const sortedPosts = Array.from(posts).sort((a, b) => {
        let aValue, bValue;

        switch (criteria) {
            case 'title':
                aValue = a.querySelector('a') ? a.querySelector('a').innerText.toLowerCase() : '';
                bValue = b.querySelector('a') ? b.querySelector('a').innerText.toLowerCase() : '';
                break;
            case 'author':
                aValue = a.querySelector('.msg-aftertitle strong') ? a.querySelector('.msg-aftertitle strong').innerText.toLowerCase() : '';
                bValue = b.querySelector('.msg-aftertitle strong') ? b.querySelector('.msg-aftertitle strong').innerText.toLowerCase() : '';
                break;
            case 'datetime':
                aValue = a.querySelector('.msg-aftertitle') ? `${a.querySelector('.msg-aftertitle').innerText.match(/\d{2}-\d{2}-\d{2}/)[0]} ${a.querySelector('.msg-aftertitle').innerText.match(/\d{2}:\d{2}:\d{2}/)[0]}` : '';
                bValue = b.querySelector('.msg-aftertitle') ? `${b.querySelector('.msg-aftertitle').innerText.match(/\d{2}-\d{2}-\d{2}/)[0]} ${b.querySelector('.msg-aftertitle').innerText.match(/\d{2}:\d{2}:\d{2}/)[0]}` : '';
                break;
            default:
                aValue = '';
                bValue = '';
        }

        console.log(`Sorting by ${criteria}:`, aValue, bValue);

        return aValue.localeCompare(bValue);
    });

    const container = document.querySelector('.msg-all');
    container.innerHTML = '';
    sortedPosts.forEach(post => container.appendChild(post));
}
