from django.db import models
from django.conf import settings
from django.core.files.base import ContentFile
from django.db.models.signals import post_save
from django.dispatch import receiver
from urllib.request import urlopen
from django.apps import apps
import os

class Hotel(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    distance = models.CharField(max_length=100, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True)
    description = models.TextField(blank=True)
    rating = models.FloatField(default=0)
    featured = models.BooleanField(default=False)
    type = models.CharField(max_length=20, null=True)
    image = models.ImageField(upload_to='hotel_images', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    image_url = models.URLField(blank=True, null=True)
     
    def save(self, *args, **kwargs):
        # If a user enters an image URL, fetch it and save as image
        if self.image_url and not self.image:
            try:
                response = urlopen(self.image_url)
                file_name = os.path.basename(self.image_url.split("?")[0]) or "image.jpg"
                self.image.save(file_name, ContentFile(response.read()), save=False)
            except Exception as e:
                print(f" Error fetching image from URL: {e}")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Room(models.Model):
    hotel = models.ForeignKey(
        Hotel, related_name='rooms', on_delete=models.CASCADE)
    room_number = models.CharField(max_length=20)
    room_type = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    capacity = models.PositiveIntegerField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.hotel.name} - {self.room_number}"

class RoomImage(models.Model):
    room = models.ForeignKey( Room, 
                             related_name='images', on_delete=models.CASCADE)
    image_url = models.ImageField(upload_to='room_images', blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, null=True)
    is_primary = models.BooleanField(default=False, null=True)

    def __str__(self):
        return f"Image for {self.room}"

class BookingManager(models.Manager):
    def create_booking(self, user, room, start_date, end_date):
        # Check if user can book 
        existing_bookings = self.filter(user=user)
        if existing_bookings.exists():
            raise ValueError("User already has an existing booking")
        
        # Checking if room is available for the requested dates

        RoomAvailability = apps.get_model('users', 'RoomAvailability')
        
        conflicts = RoomAvailability.objects.filter(
            room=room,
            start_date__lte=end_date,
            end_date__gte=start_date,
            is_available=False
        )
        if conflicts.exists():
            raise ValueError("Room is not available for the selected dates")
        
        # Create the booking
        booking = self.create(user=user, room=room,
                              start_date=start_date, end_date=end_date)
             
        return booking


class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    objects = BookingManager()

    class Meta:
        # Ensuring one booking per user 
        constraints = [
            models.UniqueConstraint(
                fields=['user'], 
                name='one_booking_per_user'
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.room} ({self.start_date} to {self.end_date})"

class RoomAvailability(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.room} - {self.start_date} to {self.end_date} ({'Available' if self.is_available else 'Unavailable'})"


def is_room_available(room, start_date, end_date):
    """Check if room is available for the given date range"""
    conflicts = RoomAvailability.objects.filter(
        room=room,
        start_date__lte=end_date,
        end_date__gte=start_date,
        is_available=False
    )
    return not conflicts.exists()

def user_can_book(user):
    """Check if user already has a booking"""
    existing_bookings = Booking.objects.filter(user=user)
    return not existing_bookings.exists()

# Django signal to automatically update room availability when booking is created
@receiver(post_save, sender=Booking)
def update_room_availability(sender, instance, created, **kwargs):
    """Automatically update room availability when a booking is created"""
    if created:  
        #setting room's is_available field to False when a new booking is created 
        instance.room.is_available = False
        instance.room.save()
        
        # Create RoomAvailability record for date-specific tracking
        RoomAvailability.objects.create(
            room=instance.room,
            start_date=instance.start_date,
            end_date=instance.end_date,
            is_available=False
        )