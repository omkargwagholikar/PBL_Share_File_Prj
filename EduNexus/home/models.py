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
        try:
            if(len(z)<5):
                for j in z:
                    for i in j:
                        if(len(l1)<=20):
                            l1.append(i[1])
                        else:
                            break   
            else:
                for j in z:
                    for i in j:
                        if(len(l1)<=10):
                            l1.append(i[1])
                        else:
                            break            
            s=str(l1)
        except:
            s="['No Keywords Found']"
        return s
    
    def __str__(self) -> str:
        return self.file.name
class file_name_against_keyword(models.Model):
    filename=models.CharField(max_length=1024)
    keyword=models.CharField(max_length=1024)
    
    def __str__(self) -> str:
        return self.filename

class keyword_against_file_name(models.Model):
    filename=models.CharField(max_length=1024)
    keyword=models.CharField(max_length=2024)

    def __str__(self) -> str:
        return self.keyword


class UserSettings(models.Model):
    """Per-user settings, including the Hugging Face access token used to
    download embedding / OCR / summarization models from the HF Hub.

    `uid` matches the Firebase auth UID. For anonymous / single-user demo
    setups we fall back to a singleton row with uid == "default".

    `hf_token` is stored as a Django-signed blob so an attacker who reads the
    raw row cannot use the token without the SECRET_KEY. This is obfuscation,
    not encryption — replace with a KMS-backed secret store in production.
    """

    uid = models.CharField(max_length=128, unique=True, default="default")
    hf_token_blob = models.TextField(blank=True, default="")
    default_embedding_model = models.CharField(
        max_length=255,
        default="sentence-transformers/all-MiniLM-L6-v2",
    )
    last_download_status = models.CharField(max_length=64, blank=True, default="")
    last_download_message = models.TextField(blank=True, default="")
    last_download_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_hf_token(self, raw_token: str) -> None:
        from django.core.signing import dumps
        self.hf_token_blob = dumps(raw_token) if raw_token else ""

    def get_hf_token(self) -> str:
        from django.core.signing import loads, BadSignature
        if not self.hf_token_blob:
            return ""
        try:
            return loads(self.hf_token_blob)
        except BadSignature:
            return ""

    def has_token(self) -> bool:
        return bool(self.hf_token_blob)

    def __str__(self) -> str:
        return f"UserSettings({self.uid})"
