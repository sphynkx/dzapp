from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import MsgDb, User
from .forms import CommentForm
from django.utils import timezone

def index(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        title = request.GET.get('title', 'default_title')
        if MsgDb.objects.filter(title=title).exists():
            msg = MsgDb.objects.get(title=title)
            data = {
                'message': msg.content,
                'title': msg.title,
                'user_name': msg.user.username,
                'date': msg.published_date.strftime('%Y-%m-%d'),
                'time': msg.published_time.strftime('at %H:%M:%S'),
                'comments': [
                    {
                        'id': comment.id,
                        'content': comment.content,
                        'user__username': comment.user.username,
                        'published_date': comment.published_date.strftime('%Y-%m-%d'),
                        'published_time': comment.published_time.strftime('at %H:%M:%S')
                    }
                    for comment in msg.comments.all() ## apply date/time format for all comments
                ]
            }
            return JsonResponse(data)
        else:
            return JsonResponse({'error': 'Message does not exist'}, status=404)
    else:
        msgs = MsgDb.objects.select_related('user').filter(is_root=True)  ## display root posts only
        return render(request, 'index.html', context={'msgs': msgs})

def add_comment(request):
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data['content']
            user_name = form.cleaned_data['user_name']
            parent_id = request.POST.get('parent_id')
            user, created = User.objects.get_or_create(username=user_name)
            parent = MsgDb.objects.get(id=parent_id) if parent_id else None ## consider as root post
            comment = MsgDb.objects.create(
                title=f"Comment by {user.username}",
                user=user,
                published_date=timezone.now().date(),
                published_time=timezone.now().time(),
                content=content,
                parent=parent,
                is_root=False  ## consider as comment
            )
            return redirect('/')
        else:
            return render(request, 'index.html', {'form': form, 'msgs': MsgDb.objects.select_related('user').filter(is_root=True)})
    else:
        form = CommentForm()
    return render(request, 'index.html', {'form': form, 'msgs': MsgDb.objects.select_related('user').filter(is_root=True)})
