from enum import Enum

class DamageClass(Enum):
    POTHOLE = 0
    CRACK = 1
    ROAD_SURFACE_DAMAGE = 2
    EDGE_DAMAGE = 3

# Mapping from class IDs to human readable names
CLASS_ID_TO_NAME = {
    DamageClass.POTHOLE.value: "POTHOLE",
    DamageClass.CRACK.value: "CRACK",
    DamageClass.ROAD_SURFACE_DAMAGE.value: "ROAD_SURFACE_DAMAGE",
    DamageClass.EDGE_DAMAGE.value: "EDGE_DAMAGE",
}
