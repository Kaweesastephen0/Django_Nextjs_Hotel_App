from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from .hotel_models import Hotel, Room, Booking, RoomImage
from .hotel_serializers import HotelSerializer, RoomSerializer, BookingSerializer, RoomImageSerializer
from rest_framework.decorators import action
from django.http import JsonResponse, request
from django.db.models import Count
from django.db import IntegrityError

class HotelListView(generics.ListCreateAPIView):
    serializer_class = HotelSerializer
    
    def get_queryset(self):
        queryset = Hotel.objects.all()
        
        # Filtering by city/destination
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filtering by price range
        min_price = self.request.query_params.get('min', None)
        max_price = self.request.query_params.get('max', None)
        
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
                
        if max_price and max_price != '999':
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        return queryset
   

class HotelDetailsView(generics.RetrieveAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer

class FeaturedHotels(generics.ListAPIView):
    serializer_class = HotelSerializer
    
    def get_queryset(self):
        return Hotel.objects.filter(featured=True)

def HotelCountView(request):
    data = (
        Hotel.objects
        .values('type')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    return JsonResponse(list(data), safe=False)

def HotelLocationView(request):
    data = (
        Hotel.objects
        .values('city')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    return JsonResponse(list(data), safe=False)

class AllRoomsView(generics.ListAPIView):
    queryset = Room.objects.prefetch_related('images').all()
    serializer_class = RoomSerializer

class RoomListView(generics.ListCreateAPIView):
    serializer_class = RoomSerializer
   

    def get_queryset(self):
        hotel_id = self.request.query_params.get('hotel_id')
        if hotel_id:
            return Room.objects.filter(hotel_id=hotel_id)
        return Room.objects.all()
    
  # Allowing multiple file upload  
    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
      
        room = self.get_object()
        files = request.FILES.getlist('images')

        for file in files:
            RoomImage.objects.create(room=room, image=file)

        return Response({'message': 'Images uploaded successfully!'}, status=status.HTTP_201_CREATED)

class RoomDetails(generics.RetrieveAPIView):
    queryset = Room.objects.all()  
    serializer_class = RoomSerializer
    
class RoomImageView(generics.ListCreateAPIView):
    serializer_class = RoomImageSerializer
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            return RoomImage.objects.filter(room_id=room_id)
        return RoomImage.objects.all()
    
    

class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError as e:
            # Limiting duplicate booking
            if 'one_booking_per_user' in str(e):
                raise serializers.ValidationError("You already booked a room")
            raise e
    
    def create(self, request, *args, **kwargs):
        """Overriding create method to provide better error handling"""
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
