from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from .models import MsgDb, User
from .forms import CommentForm, PostForm
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
                    'email': comment.user.email,
                    'homepage': comment.user.homepage,
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
        msgs = MsgDb.objects.select_related('user').filter(is_root=True).order_by('-published_date', '-published_time')
        comment_form = CommentForm()
        post_form = PostForm()
        return render(request, 'index.html', context={'msgs': msgs, 'comment_form': comment_form, 'post_form': post_form})

def add_comment(request):
    if request.method == 'POST' or request.headers.get('x-requested-with') == 'XMLHttpRequest':
        form = CommentForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data['content']
            user_name = form.cleaned_data['user_name']
            email = form.cleaned_data['email']
            homepage = form.cleaned_data['homepage']
            parent_id = request.POST.get('parent_id')

            try:
                parent = MsgDb.objects.get(id=parent_id) if parent_id else None
            except MsgDb.DoesNotExist:
                return JsonResponse({'error': 'Parent comment does not exist'}, status=400)

            user, created = User.objects.get_or_create(username=user_name, email=email, homepage=homepage)

            if created:
                user.email = email
                user.homepage = homepage
                user.save()

            comment = MsgDb.objects.create(
                title=f"Comment by {user.username}",
                user=user,
                published_date=timezone.now().date(),
                published_time=timezone.now().time(),
                content=content,
                parent=parent,
                is_root=False,
                has_child=False
            )
            if parent:
                parent.has_child = True
                parent.save()

            def get_comment_data(comment):
                return {
                    'id': comment.id,
                    'content': comment.content,
                    'user__username': comment.user.username,
                    'email': comment.user.email,
                    'homepage': comment.user.homepage,
                    'published_date': comment.published_date.strftime('%Y-%m-%d'),
                    'published_time': comment.published_time.strftime('at %H:%M:%S'),
                    'has_child': comment.has_child,
                    'children': []
                }

            data = {
                'parent_id': parent_id,
                'comment': get_comment_data(comment)
            }

            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse(data)
            else:
                return redirect('/')
        else:
            return JsonResponse({'error': 'Invalid form data'}, status=400)
    return JsonResponse({'error': 'Invalid request method or headers'}, status=400)

def add_post(request):
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data['title']
            user_name = form.cleaned_data['user_name']
            password = form.cleaned_data['password']
            content = form.cleaned_data['content']
            logger.info(f"Received data - title: {title}, user_name: {user_name}, password: {password}, content: {content}")
            try:
                user = User.objects.get(username=user_name)
                logger.info(f"User found: {user}")
                if user.check_password(password):
                    if user.author:
                        post = MsgDb.objects.create(
                            title=title,
                            user=user,
                            content=content,
                            is_root=True,
                            has_child=False,
                            published_date=timezone.now().date(),
                            published_time=timezone.now().time()
                        )
                        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                            data = {
                                'id': post.id,
                                'title': post.title,
                                'user_name': post.user.username,
                                'date': post.published_date.strftime('%Y-%m-%d'),
                                'time': post.published_time.strftime('%H:%M:%S'),
                                'content': post.content,
                            }
                            return JsonResponse(data)
                        return redirect('index')
                    else:
                        logger.error(f"User {user_name} is not authorized to create posts. user.author: {user.author}")
                        return JsonResponse({'error': 'User is not authorized to create posts'}, status=400)
                else:
                    logger.error(f"Invalid password for user {user_name}.")
                    return JsonResponse({'error': 'Invalid credentials or unauthorized user'}, status=400)
            except User.DoesNotExist:
                logger.error(f"User {user_name} does not exist.")
                return JsonResponse({'error': 'User does not exist'}, status=400)
        else:
            logger.error(f"Invalid form data: {form.errors}")
            return JsonResponse({'error': 'Invalid form data', 'form_errors': form.errors}, status=400)
    logger.error(f"Invalid request method: {request.method}")
    return JsonResponse({'error': 'Invalid request method'}, status=400)
