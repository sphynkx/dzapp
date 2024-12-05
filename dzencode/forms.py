from django import forms

class CommentForm(forms.Form):
    user_name = forms.CharField(max_length=50, required=True, widget=forms.TextInput(attrs={'autocomplete': 'off'}))
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'autocomplete': 'off'}))
    homepage = forms.URLField(required=False, widget=forms.URLInput(attrs={'autocomplete': 'off'}))
    content = forms.CharField(widget=forms.Textarea(attrs={'autocomplete': 'off'}), required=True)

class PostForm(forms.Form):
    title = forms.CharField(max_length=255, required=True, widget=forms.TextInput(attrs={'autocomplete': 'off'}))
    user_name = forms.CharField(max_length=50, required=True, widget=forms.TextInput(attrs={'autocomplete': 'username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'autocomplete': 'current-password'}), required=True)
    content = forms.CharField(widget=forms.Textarea(attrs={'autocomplete': 'off'}), required=True)
