# PBL_Share_File_Prj

Setting up a Django project involves several steps, including installing Django, creating a project, defining a database, and configuring the project settings. Here's a step-by-step guide to help you set up a basic Django project:

# Step 1: Install Django
Ensure you have Python installed on your system. You can install Django using pip, which is the package installer for Python.

bash
Copy code
pip install Django
# Step 2: Create a Django Project
Navigate to the directory where you want to create your project and run the following command:

bash
Copy code
django-admin startproject yourprojectname
Replace "yourprojectname" with the desired name for your project.

# Step 3: Navigate to the Project Directory
Move to the project directory:

bash
Copy code
cd yourprojectname
# Step 4: Run Migrations
Django uses migrations to create database tables based on your models. Run the following commands to apply migrations:

bash
Copy code
python manage.py migrate
# Step 5: Create a Django App
Django projects are composed of apps. Create an app within your project:

bash
Copy code
python manage.py startapp yourappname
Replace "yourappname" with the desired name for your app.

# Step 6: Define Models
In your app, open the models.py file and define your data models using Django's model syntax.

# Step 7: Make Migrations for the App
Run the following commands to create and apply migrations for your app:

bash
Copy code
python manage.py makemigrations yourappname
python manage.py migrate
Step 8: Create a Superuser
Create an admin superuser to manage your app's data:

bash
Copy code
python manage.py createsuperuser
Follow the prompts to set up your admin user.

Step 9: Run the Development Server
Start the development server to see your project in action:

bash
Copy code
python manage.py runserver
Visit http://127.0.0.1:8000/ in your web browser to view your Django project.

Step 10: Access the Admin Interface
Go to http://127.0.0.1:8000/admin/ and log in with the superuser credentials you created. This is the Django admin interface where you can manage your app's data.

# Additional Steps (Optional):
Modify the settings.py file to configure database settings, add installed apps, and other project-specific configurations.
Create views and templates for your app.
Connect URLs by creating a urls.py file in your app.
This is a basic setup for a Django project. As your project grows, you may need to configure additional settings, add more apps, and organize your code accordingly. Refer to the Django documentation for more advanced configurations and features: Django Documentation.
