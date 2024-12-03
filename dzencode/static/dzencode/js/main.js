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

    addReplyHandlers(); // Reply buttons for comments
});
