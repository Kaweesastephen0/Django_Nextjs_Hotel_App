from rest_framework import serializers
from .hotel_models import Hotel, Room, Booking, RoomImage
from django.core.files.base import ContentFile
from urllib.request import urlopen
import os


class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    images = RoomImageSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'hotel', 'room_number', 'room_type', 'price', 'capacity', 'is_available', 'images']

class HotelSerializer(serializers.ModelSerializer):
    image_url = serializers.URLField(
        write_only=True, required=False, allow_blank=True)
    rooms = RoomSerializer(many=True, read_only=True)
    class Meta:
        model = Hotel
        fields = ['id', 'name','address', 'city', 'distance', 'price', 'description', 'rooms', 'rating', 'featured', 'type', 'image', 'image_url', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        image_url = validated_data.pop('image_url', None)
        image_file = validated_data.pop('image', None)
        hotel = Hotel(**validated_data)

        # image url
        if image_url and not image_file:
            try:
                response = urlopen(image_file)
                file_name = os.path.basename(image_url.split("?"[0]))
                hotel.image.save(file_name, ContentFile(
                    response.read()), save=False)
            except Exception as e:
                raise serializers.ValidationError({"image_url": f"Failed to fetch image: {str(e)}"})
        elif image_file:
            hotel.image = image_file

        hotel.save()
        return hotel

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user']  
    
    def create(self, validated_data):
        """Using the custom BookingManager to create booking with validation"""
        try:

            booking = Booking.objects.create_booking(
                user=validated_data['user'],
                room=validated_data['room'],
                start_date=validated_data['start_date'],
                end_date=validated_data['end_date']
            )
            return booking
        except ValueError as e:
            # Converting ValueError to ValidationError for proper API response
            raise serializers.ValidationError(str(e))
