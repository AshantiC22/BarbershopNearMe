from django.core.management.base import BaseCommand
from core.models import Service


class Command(BaseCommand):
    help = "Seed the database with real services for Barbershopnearme"

    def handle(self, *args, **kwargs):

        services = [
            {"name": "Haircut",                "price": "25.00", "duration_minutes": 30},
            {"name": "Haircut & Shave",         "price": "40.00", "duration_minutes": 60},
            {"name": "Kids Haircut (Age 1-12)", "price": "30.00", "duration_minutes": 30},
            {"name": "Straight Shave",          "price": "20.00", "duration_minutes": 30},
            {"name": "Line Up / Edge Up",       "price": "15.00", "duration_minutes": 20},
            {"name": "Beard Trim",              "price": "15.00", "duration_minutes": 20},
            {"name": "Beard Line",              "price": "15.00", "duration_minutes": 20},
        ]

        created = 0
        updated = 0
        for svc in services:
            obj, was_created = Service.objects.update_or_create(
                name=svc["name"],
                defaults={
                    "price":            svc["price"],
                    "duration_minutes": svc["duration_minutes"],
                },
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"  ✓ Created: {obj.name} — ${obj.price}"))
            else:
                updated += 1
                self.stdout.write(f"  ↻ Updated: {obj.name} — ${obj.price}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. {created} created, {updated} updated.\n"
            f"Barbers are added via the barber signup page using an invite code."
        ))
