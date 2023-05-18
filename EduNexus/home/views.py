from django.shortcuts import render,HttpResponse
from .models import Files,file_name_against_keyword,keyword_against_file_name
import pyrebase
from django.contrib import auth
from django.contrib.auth import authenticate
# Create your views here.
#API CREDENTIALS
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
#authe=firebase.auth()
authe=firebase.auth()
database=firebase.database()
def signin(request):
    print("signin")
    return render(request,"signin.html")
def postsignin(request):
    email=request.POST.get('email')
    passw=request.POST.get('pass')
    try:
        print("iriroorrkn")
        user=authe.sign_in_with_email_and_password(email,passw)
    except:
        print("hello")
        message="Invalid Credentials"
        return render(request,"signin.html",{"messe":message})
    print("hi1")
    session_id= user['idToken']   
    request.session['uid']=str(session_id)    
    #nm=database.child('Data').child('Name').get().val()
    return render(request,'home_page.html') 
def searchfile(request):
    print("hi")
    return render(request,'searchfile.html')
def home_page(request):
    print("signin")
    return render(request,"home_page.html")
def main_page(request):
    if request.method=='POST':
        if 'Upload' in request.POST:
            print("Main Page Post request")
            file2=request.FILES['document']
            document1=Files(file=file2)
            document1.save(file2)
            file_name = document1.filename()

            upload_file(file_name)

            link = download_file(file_name)
            
            s=document1.extract_keyword()
            fileObject=file_name_against_keyword.objects.filter(filename=file_name)
            print("Objects here: ", fileObject)
            print("Document word:",s)

            file_name_against_keyword(filename=file_name, keyword=s).save()
            
            # y=eval(x)
            # s1=eval(s)            
            # file_name_against_keyword(file_name=file_name,keyword=str(y))
            # for j in s1:
            #     x1=keyword_against_file_name.objects.filter(keyword=j)
            #     y1=eval(x1)
            #     if(len(y1)==0):
            #         y1.append(file_name)
            #         keyword_against_file_name(keyword=str(y1),keyword=file_name)
            #     else:        
            #         obj=keyword_against_file_name()
            #         y1.append(file_name)
            #         obj.keyword=str(y1)
            #         obj.save()
            
            print(file_name)
            return render(request,'signin.html') 
        else:
            print("Main Page Post Else")
    """email=request.POST.get('email')
    passw=request.POST.get('pass')
    try:
        print("iriroorrkn")
        user=authe.sign_in_with_email_and_password(email,passw)
    except:
        print("hello")
        message="Invalid Credentials"
        return render(request,"signin.html",{"messe":message})
    print("hi1")
    session_id= user['idToken']   
    request.session['uid']=str(session_id) """   
    nm=database.child('Data').child('Name').get().val()
       
    return render(request,"main_page.html",{
         "name":nm,        
    })

def logout(request):
    auth.logout(request)
    return render(request,'signin.html')
def signup(request):
    return render(request,'signup.html')
def postsignup(request):
    name=request.POST.get('name')
    email=request.POST.get('email')
    passw=request.POST.get('pass')
    
    try:
        user=authe.create_user_with_email_and_password(email,passw)
    except:
        message="unable to create account try again"
        return render(request,"signup.html",{"messg":message})
    uid=user['localId']
    data={"name":name,"status":"1"}
    database.child("users").child(uid).child("details").set(data)   
    return render(request,"signin.html")
def upload_file(file_name):
    storage = firebase.storage()
    #storage.child(f"/Media/{file_name}").put(f"C:/Users/DELL/Desktop/PBL_Share_File_Prj/EduNexus/media/{file_name}")
    storage.child(f"/Media/{file_name}").put(f"media/{file_name}")
def download_file(file_name):
    storage = firebase.storage()
    return storage.child(f"/Media/{file_name}").get_url(token=None)





