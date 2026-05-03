from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="last_seen_newsletter",
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text="Last time user visited /newsletter",
            ),
        ),
    ]
