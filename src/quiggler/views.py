from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions

from quiggler.models import Fabric, Quilt
from quiggler.serializers import FabricSerializer, QuiltSerializer, UserSerializer, GroupSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuiltViewSet(viewsets.ModelViewSet):
    queryset = Quilt.objects.all()
    serializer_class = QuiltSerializer


class FabricViewSet(viewsets.ModelViewSet):
    queryset = Fabric.objects.all()
    serializer_class = FabricSerializer
