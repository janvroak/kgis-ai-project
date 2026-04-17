import geopandas as gpd
from shapely.geometry import Point

# -----------------------------
# LOAD DATA
# -----------------------------
water = gpd.read_file("data/water_clean.geojson")
forest = gpd.read_file("data/forest_clean.geojson")
restricted = gpd.read_file("data/restricted_clean.geojson")

# Convert to metric CRS (meters)
water = water.to_crs(epsg=3857)
forest = forest.to_crs(epsg=3857)
restricted = restricted.to_crs(epsg=3857)


def analyze_location(lat: float, lon: float):
    # Convert input point to same CRS
    point = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326").to_crs(epsg=3857)[0]

    # -------------------------
    # DISTANCES (meters)
    # -------------------------
    water_dist = water.distance(point).min()
    forest_dist = forest.distance(point).min()
    restricted_dist = restricted.distance(point).min()

    # -------------------------
    # ROBUST LOGIC (FINAL)
    # -------------------------

    # Treat "inside water" using distance (not polygon)
    in_water = water_dist < 50          # ~inside lake
    near_water = water_dist < 150       # near lake

    # Forest proximity
    in_forest = forest_dist < 100       # effectively inside forest
    near_forest = forest_dist < 300     # near forest

    # Restricted zones
    in_restricted = restricted_dist < 50
    near_restricted = restricted_dist < 100

    # -------------------------
    # RETURN CLEAN OUTPUT
    # -------------------------
    return {
        # WATER
        "in_water": bool(in_water),
        "near_water": bool(near_water),
        "water_distance_m": round(float(water_dist), 2),

        # FOREST
        "in_forest": bool(in_forest),
        "near_forest": bool(near_forest),
        "forest_distance_m": round(float(forest_dist), 2),

        # RESTRICTED
        "in_restricted": bool(in_restricted),
        "near_restricted": bool(near_restricted),
        "restricted_distance_m": round(float(restricted_dist), 2),
    }