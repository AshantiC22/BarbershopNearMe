from django.core.management.base import BaseCommand
from core.models import Service


class Command(BaseCommand):
    help = "Seed the database with initial services for Barbershopnearme"

    def handle(self, *args, **kwargs):

        services = [
            {"name": "The Classic",          "price": "28.00", "duration_minutes": 30},
            {"name": "Straight Shave",        "price": "35.00", "duration_minutes": 45},
            {"name": "Full Service",          "price": "55.00", "duration_minutes": 60},
            {"name": "Beard Line",            "price": "22.00", "duration_minutes": 20},
            {"name": "Kids Cutz (Age 1-12)",  "price": "25.00", "duration_minutes": 30},
            {"name": "Senior Cut",            "price": "25.00", "duration_minutes": 30},
            {"name": "Line Up",               "price": "20.00", "duration_minutes": 20},
            {"name": "Beard Trim",            "price": "20.00", "duration_minutes": 20},
        ]

        created_count = 0
        for svc in services:
            obj, created = Service.objects.get_or_create(
                name=svc["name"],
                defaults={
                    "price":            svc["price"],
                    "duration_minutes": svc["duration_minutes"],
                },
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  ✓ Service: {obj.name} — ${obj.price}"))
            else:
                self.stdout.write(f"  – Already exists: {obj.name}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. Created {created_count} service(s).\n"
            f"Barbers are added via the barber signup page using an invite code."
        ))
