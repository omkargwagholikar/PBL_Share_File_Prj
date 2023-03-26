from django.db import models

# Create your models here.
class Files(models.Model):
    """keywords=models.CharField(max_length=122)
    file_name=models.CharField(max_length=122)"""
    file=models.FileField(default="")
    


# class (models.Model):    
