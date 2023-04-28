from django.shortcuts import render,HttpResponse
from .models import Files
import pyrebase
# Create your views here.
config={
    "apiKey": "AIzaSyA-0Ej92Ijqp6QWBdIeOLkYu9SV_pkegsQ",
    "authDomain": "test1-3a1ac.firebaseapp.com",
    "projectId": "test1-3a1ac",
    "databaseURL": "https://test1-3a1ac-default-rtdb.firebaseio.com",
    "storageBucket": "test1-3a1ac.appspot.com",
    "messagingSenderId": "1079616842106",
    "appId": "1:1079616842106:web:6bb007499e14b610dacec3",   
}
firebase=pyrebase.initialize_app(config)
authe=firebase.auth()
database=firebase.database()

def index(request):
    nm=database.child('Data').child('Name').get().val()
    if request.method=='POST':
        file2=request.FILES['document']
        document1=Files(file=file2)
        document1.save(file2)
        file_name = document1.filename()
        upload_file(file_name)
        link = download_file(file_name)
    return render(request,"index.html",{
        "name":nm,
        "link":link,
    })

def upload_file(file_name):
    storage = firebase.storage()
    storage.child(f"/Media/{file_name}").put(f"C:/Users/DELL/Desktop/PBL_Share_File_Prj/EduNexus/media/{file_name}")

def download_file(file_name):
    storage = firebase.storage()
    return storage.child(f"/Media/{file_name}").get_url(token=None)