from django.db import models
import os
#from keywords import Keywords
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
    

# class (models.Model):    
