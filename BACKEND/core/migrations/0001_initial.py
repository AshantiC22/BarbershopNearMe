from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [

        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, blank=True, default='')),
                ('price', models.DecimalField(decimal_places=2, max_digits=6)),
                ('duration_minutes', models.PositiveIntegerField(default=30)),
            ],
        ),

        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('security_question', models.CharField(blank=True, default='', max_length=200)),
                ('security_answer', models.CharField(blank=True, default='', max_length=200)),
                ('strike_count', models.PositiveIntegerField(default=0)),
                ('deposit_fee', models.DecimalField(decimal_places=2, default=10.0, max_digits=6)),
                ('terms_accepted', models.BooleanField(default=False)),
                ('terms_accepted_at', models.DateTimeField(blank=True, null=True)),
                ('phone', models.CharField(blank=True, default='', max_length=20)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),

        migrations.CreateModel(
            name='Barber',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, blank=True, default='')),
                ('bio', models.TextField(blank=True, default='')),
                ('photo', models.ImageField(blank=True, null=True, upload_to='barbers/')),
                ('photo_data', models.TextField(blank=True, default='')),
                ('cashapp_tag', models.CharField(blank=True, default='', max_length=50)),
                ('stripe_account_id', models.CharField(blank=True, default='', max_length=100)),
                ('user', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='barber_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),

        migrations.CreateModel(
            name='BarberServicePrice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('price', models.DecimalField(decimal_places=2, max_digits=6)),
                ('barber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='custom_prices', to='core.barber')),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='barber_prices', to='core.service')),
            ],
            options={'unique_together': {('barber', 'service')}},
        ),

        migrations.CreateModel(
            name='BarberAvailability',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('day_of_week', models.IntegerField(choices=[(0,'Monday'),(1,'Tuesday'),(2,'Wednesday'),(3,'Thursday'),(4,'Friday'),(5,'Saturday'),(6,'Sunday')])),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('is_working', models.BooleanField(default=True)),
                ('barber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='availability', to='core.barber')),
            ],
            options={'unique_together': {('barber', 'day_of_week')}},
        ),

        migrations.CreateModel(
            name='BarberTimeOff',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('date', models.DateField()),
                ('reason', models.CharField(blank=True, default='', max_length=200)),
                ('barber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='time_off', to='core.barber')),
            ],
            options={'unique_together': {('barber', 'date')}},
        ),

        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('date', models.DateField()),
                ('time', models.TimeField()),
                ('status', models.CharField(choices=[('pending_shop','Pending Shop Confirmation'),('confirmed','Confirmed'),('completed','Completed'),('no_show','No Show'),('cancelled','Cancelled')], default='confirmed', max_length=20)),
                ('payment_method', models.CharField(choices=[('online','Online'),('shop','Pay In Shop')], default='shop', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('shop_confirmed_at', models.DateTimeField(blank=True, null=True)),
                ('review_notified', models.BooleanField(default=False)),
                ('reminder_sent', models.BooleanField(default=False)),
                ('reminder_2hr_sent', models.BooleanField(default=False)),
                ('barber_reminder_2hr', models.BooleanField(default=False)),
                ('barber_reminder_now', models.BooleanField(default=False)),
                ('barber_notes', models.TextField(blank=True, default='')),
                ('client_notes', models.TextField(blank=True, default='')),
                ('is_walk_in', models.BooleanField(default=False)),
                ('deposit_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=6)),
                ('deposit_paid', models.BooleanField(default=False)),
                ('deposit_session_id', models.CharField(blank=True, default='', max_length=200)),
                ('late_cancel', models.BooleanField(default=False)),
                ('barber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.barber')),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.service')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={'unique_together': {('barber', 'date', 'time')}},
        ),

        migrations.CreateModel(
            name='NewsletterPost',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('body', models.TextField()),
                ('category', models.CharField(choices=[('deal','Deal / Discount'),('promo','Promotion'),('update','Shop Update'),('event','Event'),('general','General')], default='general', max_length=20)),
                ('emoji', models.CharField(blank=True, default='✂️', max_length=8)),
                ('active', models.BooleanField(default=True)),
                ('pinned', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('barber', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='posts', to='core.barber')),
            ],
            options={'ordering': ['-pinned', '-created_at']},
        ),

        migrations.CreateModel(
            name='WaitlistEntry',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('client_name', models.CharField(max_length=100)),
                ('client_phone', models.CharField(blank=True, default='', max_length=30)),
                ('client_email', models.CharField(blank=True, default='', max_length=200)),
                ('date', models.DateField()),
                ('notes', models.TextField(blank=True, default='')),
                ('notified', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('barber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='waitlist', to='core.barber')),
                ('service', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.service')),
            ],
            options={'ordering': ['created_at']},
        ),

        migrations.CreateModel(
            name='BarberClient',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('notes', models.TextField(blank=True, default='')),
                ('is_vip', models.BooleanField(default=False)),
                ('is_blocked', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('barber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='clients', to='core.barber')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='barber_relationships', to=settings.AUTH_USER_MODEL)),
            ],
            options={'unique_together': {('barber', 'client')}},
        ),

        migrations.CreateModel(
            name='RescheduleRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('initiated_by', models.CharField(choices=[('client','Client'),('barber','Barber')], max_length=10)),
                ('new_date', models.DateField()),
                ('new_time', models.TimeField()),
                ('status', models.CharField(choices=[('pending','Pending'),('accepted','Accepted'),('rejected','Rejected'),('expired','Expired')], default='pending', max_length=10)),
                ('token', models.CharField(max_length=64, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('appointment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reschedule_requests', to='core.appointment')),
            ],
        ),

        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('completed', models.BooleanField(default=True)),
                ('rating', models.PositiveSmallIntegerField(default=5)),
                ('comment', models.TextField(blank=True, default='')),
                ('barber_reply', models.TextField(blank=True, default='')),
                ('replied_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('appointment', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='review', to='core.appointment')),
                ('barber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='core.barber')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),

        migrations.CreateModel(
            name='PushSubscription',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False)),
                ('endpoint', models.TextField()),
                ('p256dh', models.TextField()),
                ('auth', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='push_subscription', to=settings.AUTH_USER_MODEL)),
            ],
        ),

    ]
