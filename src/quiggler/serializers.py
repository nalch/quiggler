import json

from django.contrib.auth.models import User, Group
from networkx.readwrite import json_graph
from rest_framework import serializers


from quiggler.graph_creation import create_graph
from quiggler.models import Fabric, Quilt


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']


class FabricSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Fabric
        fields = ("slug", "url", "name", "image", "width_in_cm", "height_in_cm", "quilt")


class QuiltSerializer(serializers.HyperlinkedModelSerializer):
    fabrics = FabricSerializer(many=True, read_only=True, default=[])
    svg = serializers.CharField(write_only=True, default=None)

    def create(self, validated_data):
        width, height = validated_data["width"], validated_data["height"]
        graph, faces = create_graph(validated_data["type"], width + 1, height + 1)

        json_data = json_graph.node_link_data(graph)
        json_data["faces"] = faces

        validated_data["json"] = json.dumps(json_data)

        validated_data.pop("svg")

        return super().create(validated_data)

    class Meta:
        model = Quilt
        fields = (
            "slug",
            "url",
            "name",
            "type",
            "width",
            "height",
            "width_in_cm",
            "height_in_cm",
            "json",
            "fabrics",
            "svg",
            "preview"
        )
