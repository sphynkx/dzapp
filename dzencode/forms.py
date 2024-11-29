from django import forms

class CommentForm(forms.Form):
    user_name = forms.CharField(max_length=50, required=True)
    email = forms.EmailField(required=True)
    homepage = forms.URLField(required=False)
    content = forms.CharField(widget=forms.Textarea, required=True)

