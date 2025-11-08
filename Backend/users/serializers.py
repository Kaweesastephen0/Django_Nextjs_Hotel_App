from rest_framework.serializers import ModelSerializer
from .models import CustomUser
from rest_framework import serializers
from django.contrib.auth import authenticate


class customUserSerializer(ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ("id", "email", "username")


class RegisterUserSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("email", "username", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


class LoginUserSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        request = self.context.get('request') if hasattr(
            self, 'context') else None

        user = authenticate(request=request, username=data.get(
            'email'), password=data.get('password'))

        if user and user.is_active:
           
            return {"user": user}
        raise serializers.ValidationError(
            {"non_field_errors": ["Incorrect credentials."]})
