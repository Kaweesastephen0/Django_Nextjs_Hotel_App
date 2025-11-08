from django.contrib import admin
from .models import CustomUser
from .hotel_models import Hotel, Room, Booking, RoomImage, RoomAvailability


# Register your models here.
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    pass


admin.site.register(Hotel)
admin.site.register(Room)
admin.site.register(Booking)
admin.site.register(RoomImage)
admin.site.register(RoomAvailability)

