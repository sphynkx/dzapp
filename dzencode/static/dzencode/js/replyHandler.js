import { submitFormHandler } from './submitFormHandler.js';
import {
    strongButtonHandler,
    italicButtonHandler,
    codeButtonHandler,
    linkButtonHandler,
    imgButtonHandler,
    txtButtonHandler,
    imgInputChangeHandler,
    txtInputChangeHandler,
    updateTextarea
} from './editorHandler.js';

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
    applyStyles(document); // bugfix for unapplied styles
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
    document.querySelectorAll('.txt-btn').forEach(function(button) {
        button.removeEventListener('click', txtButtonHandler);
        button.addEventListener('click', txtButtonHandler);
    });
    document.querySelectorAll('.img-input').forEach(function(input) {
        input.removeEventListener('change', imgInputChangeHandler);
        input.addEventListener('change', imgInputChangeHandler);
    });
    document.querySelectorAll('.txt-input').forEach(function(input) {
        input.removeEventListener('change', txtInputChangeHandler);
        input.addEventListener('change', txtInputChangeHandler);
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

async function replyHandler(event) {
    event.preventDefault();
    console.log('Reply button clicked');
    document.querySelectorAll('.comment-form').forEach(function(form) {
        form.classList.add('hidden');
        form.reset();
        clearEditor(form);
    });
    const commentForm = event.target.nextElementSibling;
    commentForm.classList.toggle('hidden');

    const captchaField = commentForm.querySelector('.captcha');
    const captchaValueField = commentForm.querySelector('.captcha-value');

    if (captchaField && captchaValueField) {
        console.log('Captcha fields found:', captchaField, captchaValueField);
    } else {
        console.error('Captcha fields not found!');
    }
}

async function fetchCaptchaData() {
    try {
        const response = await fetch('/generate_captcha/');
        const data = await response.json();
        console.log('Fetched captcha data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching captcha data:', error);
        return null;
    }
}

function clearEditor(form) {
    const editorDiv = form.querySelector('.editor');
    editorDiv.innerHTML = '';
    updateTextarea(editorDiv);
}

function applyStyles() {
    // Bugfix - styles didn't apply immediately after comment creation
    document.querySelectorAll('.comment-content img').forEach(img => img.classList.add('comment-content'));
    document.querySelectorAll('.comment-content pre').forEach(pre => pre.classList.add('comment-content'));
}
