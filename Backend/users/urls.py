

from django.urls import path
from .views import UserInfoView, UserRegistrationView, LoginView, LogoutView, TokenRefreshView, UsersView
from .hotel_views import HotelListView, BookingListCreateView, HotelDetailsView, HotelCountView, HotelLocationView, RoomDetails, FeaturedHotels, AllRoomsView
from . import hotel_views

urlpatterns = [
    path("user-info/", UserInfoView.as_view(), name="user-info"),
    path("users/", UsersView.as_view(), name="users"),
    path("register/", UserRegistrationView.as_view(), name="register-user"),
    path("login/", LoginView.as_view(), name="user-login"),
    path("logout/", LogoutView.as_view(), name="user-logout"),
    path("refresh", TokenRefreshView.as_view(), name="refresh-token"),
    path('hotels/', HotelListView.as_view(), name='hotel-list'),
    path('hotels/featured/', FeaturedHotels.as_view(), name='featured-hotel'),
    path('hotels/hoteltypecount/', hotel_views.HotelCountView, name='hotel-typecount'),
    path('hotels/hotellocationcount', hotel_views.HotelLocationView, name='hotel-locationcount'),
    path('hotels/<int:pk>/', HotelDetailsView.as_view(), name='hotel-details'),
    path('rooms/', AllRoomsView.as_view(), name='room-list'),
    path('rooms/<int:pk>/', RoomDetails.as_view(), name='room-details'),
    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
]
