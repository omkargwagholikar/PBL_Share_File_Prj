from rake_nltk import Rake
import nltk

nltk.download('stopwords')
"""z=[(1,'b'),(1,'2'),(3,'4'),(6,'y')]
l1=[]
if(len(z)<5):
    for j in z:
        l1.append(j[1])
else:
    for j in z:
        if(len(l1)<=5):
            l1.append(j[1])        
s=str(l1)
print(s)"""
r=Rake()
print("hi")