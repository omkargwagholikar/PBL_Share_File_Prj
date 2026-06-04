from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("home", "0003_file_name_against_keyword_keyword_against_file_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserSettings",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ("uid", models.CharField(default="default", max_length=128, unique=True)),
                ("hf_token_blob", models.TextField(blank=True, default="")),
                (
                    "default_embedding_model",
                    models.CharField(
                        default="sentence-transformers/all-MiniLM-L6-v2",
                        max_length=255,
                    ),
                ),
                ("last_download_status", models.CharField(blank=True, default="", max_length=64)),
                ("last_download_message", models.TextField(blank=True, default="")),
                ("last_download_at", models.DateTimeField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
