from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ("core", "0003_merge"),
    ]
    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="welcome_push_sent",
            field=models.BooleanField(default=False, help_text="Welcome push sent once on first login after signup"),
        ),
    ]
