from django.db import models
import os
#from keywords import extract
# Create your models here.
class Files(models.Model):
    """keywords=models.CharField(max_length=122)
    file_name=models.CharField(max_length=122)"""
    file=models.FileField(default="")
    
    
    def filename(self):
        # print(os.path.getsize(self.file.name))
        # print(f"Last modification: {os.path.getmtime(self.file.name)}")
        # metaData = {
        #     "sise":os.path.getsize(self.file.name),
        #     "last_modification": os.path.getmtime(self.file.name),
        #     "name": os.path.basename(self.file.name)
        # }
        return os.path.basename(self.file.name)
    
    def tes(self):
        return os.path.getsize()
    
    def extract_keyword(self):
        #obj=extract()
        #l=obj.extract_text()
        #return l        
        z=[(1,'b'),(1,'2'),(3,'4'),(6,'y')]
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
class file_name_against_keyword(models.Model):
    filename=models.CharField(max_length=1024)
    keyword=models.CharField(max_length=1024)
    

class keyword_against_file_name(models.Model):
    filename=models.CharField(max_length=1024)
    keyword=models.CharField(max_length=2024)
# class (models.Model):    
