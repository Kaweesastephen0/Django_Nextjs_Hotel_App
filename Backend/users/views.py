from django.shortcuts import render
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import customUserSerializer, RegisterUserSerializer, LoginUserSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import CustomUser
from django.conf import settings
import logging
logger = logging.getLogger(__name__)



class UserInfoView(RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = customUserSerializer

    def get_object(self):
        return self.request.user


class UsersView(ListAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = customUserSerializer


class UserRegistrationView(CreateAPIView):
    serializer_class = RegisterUserSerializer


class LoginView(APIView):
    def post(self, request):
        serializer = LoginUserSerializer(
            data=request.data, context={'request': request})

      ##  # logging incoming payload for troubleshooting ####
        # try:
        #     logger.debug("LoginView received data: %s", request.data)
        # except Exception:
        #     logger.debug(
        #         "LoginView received data but could not serialize request.data for logging")

        # generating tokens for the users
        if serializer.is_valid():
            # returning user info from LoginUserSerializer
            user = serializer.validated_data.get('user')
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response({
                "user": customUserSerializer(user).data
            }, status=status.HTTP_200_OK)
      
            secure_flag = not settings.DEBUG
            samesite_value = "None" if not settings.DEBUG else "Lax"

            response.set_cookie(key="access_token", value=access_token,
                                httponly=True,
                                secure=secure_flag,
                                samesite=samesite_value)
            response.set_cookie(key="refresh_token",
                                value=str(refresh),
                                httponly=True,
                                secure=secure_flag,
                                samesite=samesite_value)
            return response

        # log serializer errors for debugging
        # try:
        #     logger.debug("Login serializer errors: %s", serializer.errors)
        # except Exception:
        #     logger.debug(
        #         "Login serializer errors present but could not serialize errors for logging")

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):

    def post(self, request):
        # getting refresh token from cookies
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                refresh.blacklist()
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        response = Response(
            {"message": "Successfully logged out!"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "Refresh token not provided"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            secure_flag = not settings.DEBUG
            samesite_value = "None" if not settings.DEBUG else "Lax"

            response = Response(
                {"message": "Access token refreshed successfully"}, status=status.HTTP_202_ACCEPTED)
            response.set_cookie(key="access_token", value=access_token,
                                httponly=True,
                                secure=secure_flag,
                                samesite=samesite_value)
            return response
        except InvalidToken:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
