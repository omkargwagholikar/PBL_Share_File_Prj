from django.shortcuts import render,HttpResponse
from .models import Files

# Create your views here.
def index(request):
    if request.method=='POST':
        file2=request.FILES['document']
        document1=Files(file=file2)
        document1.save(file2)
    return render(request,"index.html")