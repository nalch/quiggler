from io import BytesIO

import cairosvg
from django.contrib.auth.models import User, Group
from django.core.files import File
from rest_framework import permissions, viewsets
from rest_framework.response import Response

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

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        self.instance = self.get_object()
        serializer = self.get_serializer(self.instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(self.instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            self.instance._prefetched_objects_cache = {}

        response = Response(serializer.data)
        self.update_preview(request, self.instance)
        return response

    def update_preview(self, request, instance):
        svg_data = request.data["svg"]
        if svg_data:
            output = BytesIO(cairosvg.svg2png(svg_data))
            instance.preview.save(f"{instance.slug}_preview.png", File(output), save=True)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        self.update_preview(request, self.instance)
        return response


class FabricViewSet(viewsets.ModelViewSet):
    queryset = Fabric.objects.all()
    serializer_class = FabricSerializer
