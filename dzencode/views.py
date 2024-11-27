from django.shortcuts import render
from django.http import JsonResponse
from .models import MsgDb

def index(request):
    hellow = "Some"
    word = 'Vars'
    title = request.GET.get('title', 'default_title')

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        if MsgDb.objects.filter(title=title).exists():
            msg = MsgDb.objects.get(title=title)
            data = {
                'message': msg.content,
                'title': msg.title,
                'user_name': msg.user.username,
                'date': msg.published_date
            }
            return JsonResponse(data)
        else:
            return JsonResponse({'error': 'Message does not exist'}, status=404)
    else:
        msgs = MsgDb.objects.select_related('user').all()
        return render(request, 'index.html', context={'some': hellow, 'vars': word, 'msgs': msgs})

