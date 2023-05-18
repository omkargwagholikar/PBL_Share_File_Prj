import PyPDF2
from django.db import models
import os
from home.keywords import extract_text
#from keywords import extract
# Create your models here.
class Files(models.Model):
    file=models.FileField(default="")

    def filename(self):

        return os.path.basename(self.file.name)
    
    def tes(self):
        return os.path.getsize()
    
    def extract_keyword(self):
        z = extract_text(f"media/{self.file.name}")
        l1=[]
        if(len(z)<5):
            for j in z:
                l1.append(j[1])
        else:
            for j in z:
                if(len(l1)<=5):
                    l1.append(j[1])        
        s=str(l1)
        print(s)
        return s
class file_name_against_keyword(models.Model):
    filename=models.CharField(max_length=1024)
    keyword=models.CharField(max_length=1024)
    

class keyword_against_file_name(models.Model):
    filename=models.CharField(max_length=1024)
    keyword=models.CharField(max_length=2024)
# class (models.Model):    
