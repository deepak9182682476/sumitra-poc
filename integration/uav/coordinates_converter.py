def ship_coord_to_decimal(coord):
    """
    Convert ship coordinate format like:
    22027263N
    89030461E
    into decimal degrees.
    """

    coord = coord.strip().upper()

    # Last character is direction
    direction = coord[-1]
    numeric_part = coord[:-1]

    # Latitude → first 2 digits degrees
    # Longitude → first 3 digits degrees
    if direction in ['N', 'S']:
        degrees = int(numeric_part[:2])
        minutes = float(numeric_part[2:]) / 10000  # restore decimal minutes

    elif direction in ['E', 'W']:
        degrees = int(numeric_part[:3])
        minutes = float(numeric_part[3:]) / 10000

    else:
        raise ValueError("Invalid coordinate format")

    # Convert to decimal degrees
    decimal = degrees + (minutes / 60)

    # Apply sign for South/West
    if direction in ['S', 'W']:
        decimal = -decimal

    return decimal


def convert_ship_position(lat_str, lon_str):
    lat = ship_coord_to_decimal(lat_str)
    lon = ship_coord_to_decimal(lon_str)

    print("\nConverted Coordinates:")
    print("Latitude :", lat)
    print("Longitude:", lon)

    # Format for maps
    print("\nCopy for Google Maps:")
    print(f"{lat}, {lon}")


# ---------------- RUN ----------------
if __name__ == "__main__":
    # Example input (replace with live ship data)
    latitude_input = "2208685N"
    longitude_input = "8902764E"

    convert_ship_position(latitude_input, longitude_input)

