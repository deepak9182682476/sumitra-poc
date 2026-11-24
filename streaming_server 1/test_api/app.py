from flask import Flask, request, jsonify
import json
import os
import subprocess
import logging
from flask_cors import CORS

# Initialize Flask application
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
# Constants
MAIN_CONFIG_FILE = "config.json"

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Helper Functions
def load_config(config_path):
    """Load JSON config from a file."""
    if os.path.exists(config_path):
        with open(config_path, "r") as file:
            return json.load(file)
    else:
        logging.error(f"Config file not found at {config_path}")
        return {}

def save_config(config_path, data):
    """Save JSON config to a file."""
    with open(config_path, "w") as file:
        json.dump(data, file, indent=4)

def validate_fields(data, required_fields):
    """Validate that required fields are present in the request data."""
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    return True, ""

def restart_pm2_service(service_name):
    """Restart a PM2 service."""
    try:
        result = subprocess.run(["pm2", "restart", service_name], check=True, capture_output=True, text=True)
        logging.info(f"Service restarted successfully: {result.stdout}")
    except subprocess.CalledProcessError as e:
        logging.error(f"Error restarting PM2 service: {e.stderr}")
        return jsonify({"error": f"Failed to restart {service_name}."}), 500

def fix_rtsp_url(url):
    """Standardize RTSP URL formatting."""
    if url:
        return url.replace('%40', '@')  # Replace '%40' with '@'
    return url


def get_config_details():
    """Get details from the main config file."""
    config = load_config(MAIN_CONFIG_FILE)
    app_host = config.get("application", {}).get("app_host", "127.0.0.1")
    app_port = int(config.get("application", {}).get("app_port", 5004))
    pm2_service_name = config.get("application", {}).get("pm2_service_name", "")
    different_config_file_path = config.get("application", {}).get("different_config_file_path", "")
    
    return app_host, app_port, pm2_service_name, different_config_file_path

@app.route("/get_updated_config", methods=["GET"])
def get_updated_config():
    """Fetch updated configuration from another file."""
    config = load_config(MAIN_CONFIG_FILE)
    config_path = config.get("application", {}).get("different_config_file_path")
    
    if not config_path:
        return jsonify({"error": "No path to different config file found."}), 400
    
    updated_config = load_config(config_path)
    return jsonify(updated_config), 200

@app.route("/add_to_config", methods=["POST"])
def add_config():
    """Add new configuration entry."""
    data = request.get_json()
    required_fields = ["ip", "rtsp_url"]

    # Validate input
    is_valid, error_message = validate_fields(data, required_fields)
    if not is_valid:
        return jsonify({"error": error_message}), 400

    ip = data.get("ip")
    rtsp_url = fix_rtsp_url(data.get("rtsp_url"))

    # Load configs
    config = load_config(MAIN_CONFIG_FILE)
    config_path = config.get("application", {}).get("different_config_file_path")

    if not config_path:
        return jsonify({"error": "No path to different config file found."}), 400

    secondary_config = load_config(config_path)
    connection_details = secondary_config.get("cameras", {}).get("connection_details", {})

    if ip in connection_details:
        return jsonify({"error": f"IP {ip} already exists."}), 400

    # Add new entry
    connection_details[ip] = rtsp_url
    save_config(config_path, secondary_config)

    pm2_service_name = config.get("application", {}).get("pm2_service_name", "default-service")
    restart_pm2_service(pm2_service_name)

    return jsonify({"message": "Config added successfully."}), 201

@app.route("/update_config", methods=["POST"])
def update_config():
    """Update configuration entry."""
    data = request.get_json()

    # Ensure all four fields are provided
    required_fields = ["old_ip", "new_ip", "old_rtsp_url", "new_rtsp_url"]
    is_valid, error_message = validate_fields(data, required_fields)

    if not is_valid:
        return jsonify({"error": error_message}), 400

    # Retrieve the data from the request
    old_ip = data.get("old_ip")
    new_ip = data.get("new_ip")
    old_rtsp_url = fix_rtsp_url(data.get("old_rtsp_url"))
    new_rtsp_url = fix_rtsp_url(data.get("new_rtsp_url"))

    # Load the primary configuration
    config = load_config(MAIN_CONFIG_FILE)
    config_path = config.get("application", {}).get("different_config_file_path")

    if not config_path:
        return jsonify({"error": "No path to different config file found."}), 400

    # Load the secondary configuration
    secondary_config = load_config(config_path)
    connection_details = secondary_config.get("cameras", {}).get("connection_details", {})

    # Check if the old_ip exists in the connection details
    if old_ip in connection_details:
        # If both IP and RTSP URL are the same, no update is needed
        if old_ip == new_ip and old_rtsp_url == new_rtsp_url:
            return jsonify({"message": "No update needed, the values are the same."}), 200

        # If only the IP changes, update the IP and RTSP URL
        if old_ip != new_ip:
            # Ensure new_ip doesn't already exist in the config
            if new_ip in connection_details:
                return jsonify({"error": f"IP {new_ip} already exists."}), 400
            connection_details.pop(old_ip)
            connection_details[new_ip] = new_rtsp_url
        
        # If only the RTSP URL changes, update the RTSP URL for the old IP
        if old_rtsp_url != new_rtsp_url and old_ip == new_ip:
            connection_details[old_ip]= new_rtsp_url

        # Save the updated secondary config
        save_config(config_path, secondary_config)

        # Restart the PM2 service associated with the application
        pm2_service_name = config.get("application", {}).get("pm2_service_name", "default-service")
        restart_pm2_service(pm2_service_name)

        return jsonify({"message": "Config updated successfully."}), 200

    return jsonify({"error": f"No entry found for IP {old_ip}."}), 404


@app.route("/delete_config", methods=["GET"])
def delete_config():
    """Delete a configuration entry."""
    ip = request.args.get("ip")

    if not ip:
        return jsonify({"error": "No IP provided."}), 400

    # Load configs
    config = load_config(MAIN_CONFIG_FILE)
    config_path = config.get("application", {}).get("different_config_file_path")

    if not config_path:
        return jsonify({"error": "No path to different config file found."}), 400

    secondary_config = load_config(config_path)
    connection_details = secondary_config.get("cameras", {}).get("connection_details", {})

    if ip in connection_details:
        del connection_details[ip]
        save_config(config_path, secondary_config)

        pm2_service_name = config.get("application", {}).get("pm2_service_name", "default-service")
        restart_pm2_service(pm2_service_name)

        return jsonify({"message": f"Entry for IP {ip} deleted successfully."}), 200

    return jsonify({"error": f"No entry found for IP {ip}."}), 404

if __name__ == "__main__":
    app_host, app_port, _, _ = get_config_details()
    app.run(host=app_host, port=app_port)

