from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0004_welcome_push_sent"),
    ]

    operations = [
        migrations.CreateModel(
            name="GalleryPhoto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("photo_data", models.TextField(help_text="Base64 encoded photo data URL")),
                ("caption",    models.CharField(blank=True, default="", max_length=120)),
                ("label",      models.CharField(blank=True, default="The Work", max_length=60)),
                ("sub",        models.CharField(blank=True, default="", max_length=60)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("active",     models.BooleanField(default=True)),
                ("barber",     models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="gallery_photos", to="core.barber")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
