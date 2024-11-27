from django.contrib import admin
from .models import MsgDb

@admin.register(MsgDb)
class MsgDbAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'published_date', 'content']
    list_filter = ['user']
    search_fields = ['title', 'user__username', 'content']
