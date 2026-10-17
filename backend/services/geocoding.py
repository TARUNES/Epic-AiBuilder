from __future__ import annotations
import os
import re
import hashlib
from typing import Tuple, Dict, Any, Optional
import httpx

KNOWN_VELACHERY_LANDMARKS = [
    (r"4th main|fourth main", 12.9756, 80.2207, "4th Main Road, Velachery"),
    (r"bypass|vijayanagar", 12.9768, 80.2224, "Velachery Bypass Road / Vijayanagar Arch"),
    (r"murugu nagar|murugan nagar", 12.9739, 80.2201, "Murugu Nagar, Velachery"),
    (r"tansi nagar", 12.9784, 80.2259, "TANSI Nagar, Velachery"),
    (r"kaiveli", 12.9725, 80.2173, "Kaiveli Signal, Velachery"),
    (r"lake|dhandeeswaram", 12.9801, 80.2218, "Dhandeeswaram Lake Bund, Velachery"),
    (r"100ft|100 feet", 12.9815, 80.2198, "100 Feet Bypass Road, Velachery"),
    (r"ags colony", 12.9730, 80.2250, "AGS Colony, Velachery"),
    (r"kamarajapuram", 12.9718, 80.2229, "Kamarajapuram, Velachery"),
    (r"baby nagar|mrts|railway", 12.9798, 80.2182, "Baby Nagar / Velachery MRTS Station"),
    (r"taramani", 12.9741, 80.2268, "Taramani Link Road, Velachery"),
    (r"vgp selva", 12.9822, 80.2232, "VGP Selva Nagar, Velachery"),
    (r"gandhi road", 12.9772, 80.2168, "Gandhi Road, Velachery"),
]

def geocode_address(
    text: str,
    provided_lat: Optional[float] = None,
    provided_lng: Optional[float] = None
) -> Tuple[float, float, str]:
    """
    Geocodes an address or text snippet into coordinates.
    Prioritizes explicit GPS, then Google Maps Geocoding API if key available,
    then regex matching against known Ward 14 Velachery landmarks with deterministic jitter.
    """
    if provided_lat is not None and provided_lng is not None:
        return provided_lat, provided_lng, text[:60]

    # Google Maps Geocoding API check
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if api_key:
        try:
            with httpx.Client(timeout=4.0) as client:
                resp = client.get(
                    "https://maps.googleapis.com/maps/api/geocode/json",
                    params={"address": f"{text}, Velachery, Chennai", "key": api_key}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("status") == "OK" and data.get("results"):
                        loc = data["results"][0]["geometry"]["location"]
                        formatted = data["results"][0].get("formatted_address", text)
                        return float(loc["lat"]), float(loc["lng"]), formatted
        except Exception as e:
            print(f"Google Maps Geocoding failed: {e}. Falling back to landmark dictionary.")

    # Match against known Velachery landmarks
    lower_text = text.lower()
    for pattern, lat, lng, name in KNOWN_VELACHERY_LANDMARKS:
        if re.search(pattern, lower_text):
            # Add minor hash-based jitter (0.0001 - 0.0003) so multiple calls at the same landmark
            # don't completely overlap on deck.gl
            h = int(hashlib.md5(text.encode("utf-8")).hexdigest()[:6], 16)
            jitter_lat = ((h % 50) - 25) * 0.00001
            jitter_lng = (((h >> 6) % 50) - 25) * 0.00001
            return round(lat + jitter_lat, 6), round(lng + jitter_lng, 6), name

    # Default to center of Velachery Ward 14
    h = int(hashlib.md5(text.encode("utf-8")).hexdigest()[:6], 16)
    jitter_lat = ((h % 80) - 40) * 0.00002
    jitter_lng = (((h >> 6) % 80) - 40) * 0.00002
    return round(12.9775 + jitter_lat, 6), round(80.2212 + jitter_lng, 6), "Velachery Central, Ward 14"

async def fetch_open_meteo_weather(lat: float = 12.9775, lng: float = 80.2212) -> Dict[str, Any]:
    """
    Fetches real-time temperature, humidity, and precipitation from Open-Meteo REST API (zero key needed).
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,precipitation"
    )
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                curr = data.get("current", {})
                return {
                    "temperature_c": curr.get("temperature_2m", 31.2),
                    "relative_humidity_pct": curr.get("relative_humidity_2m", 88.0),
                    "precipitation_mm": curr.get("precipitation", 14.5),
                    "source": "Open-Meteo Real-time Weather API",
                    "status": "LIVE"
                }
    except Exception as e:
        print(f"Open-Meteo weather fetch failed: {e}. Using cached meteorological baseline.")

    return {
        "temperature_c": 31.0,
        "relative_humidity_pct": 88.0,
        "precipitation_mm": 18.0,
        "source": "Open-Meteo Baseline Cache",
        "status": "FALLBACK"
    }
