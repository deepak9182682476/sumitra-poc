# SUMITRA Cheat Sheet v2 (for the offline assistant)
Project root: ~/Documents/Sunderban/bhuj_poc

## Rules for any change
- Change only what is asked. Do not remove existing checks, rules or behaviour, even if they look like leftovers from an older project. If unsure, explain and ask first.
- Do not edit maps.component.ts.bak (old backup).
- Show only the changed lines, and say which file each change belongs to.

## What the app is
Border-security command screen for the Sundarbans site.
Radar -> Kafka -> backend creates an alarm on the first sight of a track ID -> WebSocket -> UI map.
Operator uses alarm-card buttons: Slew TI, Acknowledge, Clear, Assign UAV, Return Home.

## Ports
- UI (Angular): 4200
- Backend API: 3058, WebSocket: 8082
- PostgreSQL (db bhuj): 5432
- Offline map tiles (Docker): 6090
- Kafka 9092, ZooKeeper 2181 (on colleague's PC 172.16.8.237 per guide)
- Camera server: 10.91.245.227:8000

## Backend map (application/server)
- server.js: starts the Express app on port 3058; mounts routes and login.
- app/config/env.js: peer IP and Kafka brokers.
- app/controllers/alarm.js: alarm logic (create, acknowledge, clear, UAV).
- app/controllers/auth.js: login and roles.
- app/controllers/db.js: database helpers.
- app/controllers/map.js, zone.js, sensor.js, tracks.js: map, zone, sensor and track data.
- app/controllers/response.js: API responses.
- app/controllers/notification.js: notifications.
- app/controllers/maingate.js, language.js, image.js: other API features.
- app/service/topic.js: Kafka topic handling (radar messages).
- app/service/trackStore.js: keeps track state (which IDs are already seen).
- app/service/middleware.js: checks active-time config.
- app/service/ros.js, ros-service.js: ROS connection.
- app/routes/: URL routes.

## UI map (application/ui/src)
- config/config.ts: PEER_IP, CAMERA_API, stream_urls (video links, DEMO_FEED).
- app/pages/maps/maps.component.ts: main map page and alarm logic. Large file (about 237 KB).
- app/pages/maps/maps.component.html: map page layout and alarm card.
- app/pages/maps/track-history.component.*: track trail history.
- app/pages/maps/vms.component.*: video (VMS) view.
- app/pages/maps/maps.module.ts: which components the maps page uses.
- Other pages in app/pages: configuration, draw-mask-image, manual-route-map, post-analysis, system-configuration.
- styles.scss: global styles.

## Start order
1. sudo systemctl start zookeeper.service kafka.service
2. sudo systemctl start postgresql; docker start osm-tiles
3. Backend: cd application/server; nvm use 14.21.3; npm start
4. UI: cd application/ui; nvm use 14.21.3; npx ng serve; open http://localhost:4200

## Roles
Only Super User (1) and Operator (2) see alarm buttons.

## Alarm buttons
- Slew TI: turns the thermal camera to this alarm. Always available.
- Acknowledge: stops the sound; alarm stays.
- Clear: closes the alarm; the same track ID later creates a new alarm.
- Assign UAV, Return Home: Manual mode only, after Acknowledge.

## Auto vs Manual
- Auto: drone is sent automatically. Camera moves only on Slew TI click.
- Manual: operator clicks Assign UAV.
- Two alarms in the same zone switch the system to Manual.

## Manual Input (testing)
Track IDs 9000-9999. Start = new target; Resume = same ID, no new alarm.
Heading: 0 N, 90 E, 180 S, 270 W.

## Settings
- Colleague's PC IP: server app/config/env.js (peer_host, kafka_brokers); ui src/config/config.ts (PEER_IP).
- Camera server: ui src/config/config.ts (CAMERA_API).
- Video links: ui src/config/config.ts (stream_urls). DEMO_FEED: 'on' for demo video.
- Map centre: siteCenter / siteZoom in maps.component.ts.
- Satellite map needs online ArcGIS, so it does not work offline.

## Common problems
- No alarm buttons: not logged in, or wrong role.
- No radar data: colleague's PC off.
- Port in use: pkill -f nodemon; sudo fuser -k 8082/tcp 3058/tcp; then npm start.
- Same track ID gives no sound: use Start, not Resume.

## Known issues
- Slew TI uses the alarm position, not TI sensor 217 (about 89.0529E, 22.1286N). Camera does not point at the target yet.
- Clearing the selected alarm does not stop Slew TI tracking.
- Auto mode, alarms in different zones: drone goes to the newest alarm.
