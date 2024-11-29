from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import MsgDb, User
from .forms import CommentForm
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def index(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        title = request.GET.get('title', 'default_title')
        if MsgDb.objects.filter(title=title).exists():
            msg = MsgDb.objects.get(title=title)
            def get_comments_tree(comment):
                return {
                    'id': comment.id,
                    'content': comment.content,
                    'user__username': comment.user.username,
                    'published_date': comment.published_date.strftime('%Y-%m-%d'),
                    'published_time': comment.published_time.strftime('at %H:%M:%S'),
                    'has_child': comment.has_child,
                    'children': [get_comments_tree(c) for c in comment.comments.all()]
                }
            data = {
                'message': msg.content,
                'title': msg.title,
                'user_name': msg.user.username,
                'date': msg.published_date.strftime('%Y-%m-%d'),
                'time': msg.published_time.strftime('at %H:%M:%S'),
                'comments': [get_comments_tree(c) for c in msg.comments.filter(is_root=False)]
            }
            return JsonResponse(data)
        else:
            return JsonResponse({'error': 'Message does not exist'}, status=404)
    else:
        msgs = MsgDb.objects.select_related('user').filter(is_root=True)  ## display root posts only
        return render(request, 'index.html', context={'msgs': msgs})


def add_comment(request):
    if request.method == 'POST' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        logger.debug("Received POST request with AJAX header")
        form = CommentForm(request.POST)
        if form.is_valid():
            logger.debug("Form is valid")
            content = form.cleaned_data['content']
            user_name = form.cleaned_data['user_name']
            parent_id = request.POST.get('parent_id')
            logger.debug(f"parent_id: {parent_id}")
            user, created = User.objects.get_or_create(username=user_name)
            logger.debug(f"User: {user}, created: {created}")
            parent = MsgDb.objects.get(id=parent_id) if parent_id else None  ## consider as root post
            comment = MsgDb.objects.create(
                title=f"Comment by {user.username}",
                user=user,
                published_date=timezone.now().date(),
                published_time=timezone.now().time(),
                content=content,
                parent=parent,
                is_root=False,  ## consider as comment
                has_child=False  ## default value for new posts/comments
            )
            logger.debug(f"Created comment: {comment}")
            if parent:
                parent.has_child = True
                parent.save()
                logger.debug(f"Updated parent: {parent}")

            def get_comment_data(comment):
                return {
                    'id': comment.id,
                    'content': comment.content,
                    'user__username': comment.user.username,
                    'published_date': comment.published_date.strftime('%Y-%m-%d'),
                    'published_time': comment.published_time.strftime('at %H:%M:%S'),
                    'has_child': comment.has_child,
                    'children': []
                }

            data = {
                'parent_id': parent_id,
                'comment': get_comment_data(comment)
            }
            logger.debug(f"Returning data: {data}")
            return JsonResponse(data)
        else:
            logger.error("Form is invalid")
            logger.error(f"Form errors: {form.errors}")
            return JsonResponse({'error': 'Invalid form data'}, status=400)
    logger.error("Invalid request method or headers")
    return redirect('/')
