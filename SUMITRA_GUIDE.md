# SUMITRA – Sundarbans Setup Guide

A short guide to how the app works, how to run it, and where to change settings.

---

## 1. What the app does

SUMITRA is a border-security command screen:

- **Radar** detects moving targets.
- The app raises an **alarm** for each new target.
- The operator checks the target with the **thermal camera (Slew TI)** and can send the **drone (UAV)**.

---

## 2. Parts of the system

| Part | Where | Port | What it does |
|---|---|---|---|
| Radar | Field | – | Detects targets, sends position every second |
| Kafka + ZooKeeper | Colleague's PC `172.16.8.237` | 9092 / 2181 | Carries radar data (topic `radar_processed`) |
| Backend (Node.js) | This laptop | 3058 (API), 8082 (WebSocket) | Reads radar data, creates alarms, pushes live updates |
| Database (PostgreSQL `bhuj`) | This laptop | 5432 | Stores sensors, zones, alarms, users |
| UI (Angular) | This laptop | 4200 | The map screen |
| Offline map tiles | This laptop (Docker) | 6090 | Dark map background, works without internet |
| Camera control server | `10.91.245.227` | 8000 | Turns the camera (PTZ / tracking) |
| UAV server | Colleague's PC `172.16.8.237` | 7999 / 5000 | Sends commands to the drone |

---

## 3. How data flows

```
Radar ──► Kafka (colleague's PC) ──► Backend (this laptop) ──► Database
                                          │
                                          ▼  live push (WebSocket :8082)
                                     UI map (localhost:4200)
                                          │
              Operator: 📷 Slew TI ─► camera turns to the target
                        ✔ Acknowledge ─► sound stops
                        Assign UAV ─► drone flies to the target
                        Return Home ─► drone comes back
                        ✖ Clear ─► alarm closed
```

1. Radar sends a target (track ID, lat/lon, range) into Kafka.
2. The backend reads it. The **first time** it sees a track ID it **creates an alarm** and saves it.
3. The UI updates live: alarm card in the left list, **alarm sound**, red marker on the map, coloured trail behind the target.
4. The operator responds with the buttons on the alarm card.

---

## 4. How to start everything

Run in this order.

**1. Kafka and ZooKeeper** (systemd services)
```bash
sudo systemctl start zookeeper.service kafka.service
# restart:
sudo systemctl restart zookeeper.service kafka.service
```

**2. Database and map tiles**
```bash
sudo systemctl start postgresql
docker start osm-tiles        # use the name shown by: docker ps -a
```

**3. Backend** (one terminal only)
```bash
cd ~/Documents/Sunderban/bhuj_poc/application/server
nvm use 14.21.3
npm start
```
Look for: `Server listening on http://0.0.0.0:3058`, `Connection has been established successfully`, `Connected to Kafka`, `Consumer has joined the group`.

**4. UI** (second terminal)
```bash
cd ~/Documents/Sunderban/bhuj_poc/application/ui
nvm use 14.21.3
npx ng serve
```
Open **http://localhost:4200** and log in (top-right ➜).

---

## 5. Logins and roles

The alarm-card buttons only appear when logged in as:

| Role no. | Role | Buttons? |
|---|---|---|
| 1 | Super User | ✅ |
| 2 | Operator | ✅ |
| 3 | Watch Tower | ❌ |
| 4 | Maintenance | ❌ |
| 6 | Developer | ❌ |

Check a user's role:
```bash
sudo -u postgres psql -d bhuj -c "SELECT u.user_name, u.user_role, r.role_name FROM users u LEFT JOIN user_roles r ON r.id = u.user_role ORDER BY u.user_role;"
```

---

## 6. The alarm card (left list)

```
Alarm - 4657
zone name : Kochi
Track ID : 96
Sensors Triggered: Radar
  ✔   📷        ← buttons (logged in only)
```

| Button | What it does | When shown |
|---|---|---|
| **📷 Slew TI** | Turns the thermal camera to this alarm and opens the Slew TI window with this alarm selected | Always (Auto and Manual) |
| **✔ Acknowledge** | "Seen it" – stops the sound | Before acknowledging |
| **✖ Clear** | Closes the alarm | After acknowledging |
| **Assign UAV** | Sends the drone to this alarm's target | **Manual mode only**, after ✔ |
| **Return Home** | Brings the drone back | **Manual mode only**, after ✔ |

### Acknowledge vs Clear

| | ✔ Acknowledge | ✖ Clear |
|---|---|---|
| Sound | Stops | – |
| Alarm card | Stays | Removed |
| Map marker | Stays (acknowledged icon) | Removed |
| Database | Saves "acknowledged" event | Saves "cleared" event (history kept, visible in Post Analysis) |
| Backend | – | Forgets the track ID: if the same target is seen again, a **new** alarm is raised |

There is no separate "Reject" button – use ✖ Clear.

---

## 7. Auto vs Manual mode

Dropdown at the top right.

| | Camera (Slew TI) | Drone (UAV) |
|---|---|---|
| **Auto** | Only when you click 📷 | ✅ System sends it automatically |
| **Manual** | Only when you click 📷 | Only when you click Assign UAV |

- In Auto the **Assign UAV / Return Home** buttons are hidden so the system and the operator don't both command the drone.
- The camera **never** moves by itself – in both modes it waits for 📷.

### Two alarms at once

- **Same zone:** first alarm → drone sent automatically. Second alarm → system **switches to Manual by itself**; the operator chooses.
- **Different zones:** both stay Auto → the drone is redirected to the **newest** alarm (known weak spot).
- Note: an **acknowledged** alarm counts twice in the zone count, so one acknowledged + one new alarm also switches to Manual. Only cleared alarms stop counting.

---

## 8. Slew TI and UAV windows (map page)

Tick **Slew TI** / **UAV** at the top left of the map.

| | Slew TI | UAV |
|---|---|---|
| What | Thermal camera fixed on a tower | Camera on the drone |
| View | Side view, Day / Thermal | Top-down view |
| Moves by | Turning (pan / tilt / zoom) | Flying |
| Linked to alarm? | The **video** is not. Clicking 📷 on an alarm card **turns** the camera to it and selects it. | The **video** is not. Assign UAV on the alarm card sends the drone. |

- **Slew** = to turn quickly to point somewhere. **TI** = Thermal Imager. **UAV** = Unmanned Aerial Vehicle.
- One window, one camera: it shows the **last alarm you clicked 📷 on**. Clearing that alarm does **not** switch back to an earlier alarm – click 📷 on the one you want.

### Slew TI window buttons

| Button | Action | Needs a selected alarm? |
|---|---|---|
| ▶ | Start tracking the selected track | ✅ |
| ■ | Stop tracking | ✅ |
| 🏠 | Camera to home position | ❌ |
| ◎ | Manual lock | ❌ |
| 👁‍🗨 | Cancel track | ❌ |
| ⛶ | Fullscreen | ❌ |
| ✕ | Close window | ❌ |

A pop-up message confirms each press, or says "Camera server not reachable".

---

## 9. Manual Input panel (testing without hardware)

Button **Manual Input** at the bottom left of the map (drag the panel by its title).

**Radar target**
- **Start** – a new target (new Track ID, new alarm + sound). A used ID is skipped automatically.
- **Resume** – continue the stopped target (same ID, no new alarm).
- **Stop** – stop the target and the sound.
- **New Track** – next free Track ID.
- Heading: 0 = North, 90 = East, 180 = South, 270 = West.

**UAV** – Fly To, Fly To Target, Place, Home, Stop.

**Stop All (Radar + UAV + Sound)**, **Stop Sound only**.

**Send:** "Through backend" (full alarm flow, falls back to the UI if the backend fails) or "UI only".

Test Track IDs use **9000–9999**.

---

## 10. Where to change settings

### Colleague's PC IP (`172.16.8.237`)
| Side | File | Setting |
|---|---|---|
| Backend | `server/app/config/env.js` | `peer_host`, `kafka_brokers` |
| UI | `ui/src/config/config.ts` | `PEER_IP` |

Used for: radar Kafka, UAV commands (Assign UAV / Return Home, fly / takeoff / RTL, TCP 3250/3251), camera recording.

### Camera control server
`ui/src/config/config.ts` → `CAMERA_API: 'http://10.91.245.227:8000'`

### Video links (Day / Thermal / UAV)
`ui/src/config/config.ts`:
```ts
export const stream_urls = {
    DAY:     '...',   // Slew TI → Day
    THERMAL: '...',   // Slew TI → Thermal
    UAV:     '...',   // UAV window
    DEMO_FEED: 'on',  // 'on' = demo video, 'auto' = demo only if link fails, 'off' = real links only
}
```
- Paste the links from the RTS team, then set `DEMO_FEED: 'off'`.
- Links must start with `http://` or `https://`. `rtsp://` links must be converted first (MJPEG / HLS / WebRTC).

### Map
- Offline dark map: `http://localhost:6090` (Docker).
- **Satellite** uses ArcGIS online imagery – **not available offline**. Offline satellite needs locally hosted, licensed imagery (setting `LOCAL_SAT_MAP_URL`, port 8088).
- 📍 button zooms to the Sundarbans site: `siteCenter` / `siteZoom` in `maps.component.ts`.

---

## 11. Useful commands

**Check Kafka / ZooKeeper ports**
```bash
nc -zv localhost 2181 && nc -zv localhost 9092
```

**Check the colleague's PC services**
```bash
for p in 9092 7999 5000 3250 3251 8000 8091; do nc -zv -w 2 172.16.8.237 $p; done
```

**Read radar messages from the colleague's Kafka**
```bash
/opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server 172.16.8.237:9092 --topic radar_processed --max-messages 5
```

**Backend "address already in use" (port 8082 / 3058)**
```bash
pkill -f nodemon; sudo fuser -k 8082/tcp 3058/tcp; sleep 3
npm start
```

**Delete test alarms (Track IDs 9000–9999)** – back up first:
```bash
sudo -u postgres pg_dump -d bhuj -t alarms -t alarm_events -t alarm_tail -t alarm_videos > ~/bhuj_alarms_backup_$(date +%F).sql
sudo -u postgres psql -d bhuj <<'SQL'
BEGIN;
CREATE TEMP TABLE dummy AS SELECT alarm_id FROM alarms WHERE alarm_id::text ~ '^9[0-9]{3}$';
DELETE FROM alarm_tail   WHERE alarm_id::text IN (SELECT alarm_id::text FROM dummy);
DELETE FROM alarm_videos WHERE alarm_id::text IN (SELECT alarm_id::text FROM dummy);
DELETE FROM alarm_events WHERE alarm_id::text IN (SELECT alarm_id::text FROM dummy);
DELETE FROM alarms       WHERE alarm_id::text IN (SELECT alarm_id::text FROM dummy);
COMMIT;
SQL
```
Then restart the backend and refresh the UI.

---

## 12. Troubleshooting

| Problem | Cause / fix |
|---|---|
| No alarm buttons (✔ ✖ 📷) | Not logged in, or role is not Super User / Operator |
| No Assign UAV / Return Home | Mode is Auto, or alarm not acknowledged |
| Colleague's radar data not showing | His PC is off / unreachable; backend terminal shows no `Received Kafka message:` |
| `ECONNREFUSED 172.16.8.237:3251` | Drone status service not running on his PC – app still works |
| Slew TI / UAV window black | Video link unreachable – use `DEMO_FEED: 'on'` for testing |
| Clear Tracks | Removes only the trail lines, not the alarms |
| Same Track ID gives no new sound | Backend raises one alarm per Track ID; use **Start** (new ID), not **Resume** |

---

## 13. Known issues

- **Slew TI pointing:** when 📷 is clicked, the code uses the alarm's position as the camera position, so the camera does not point at the target correctly yet. It should use the TI sensor position (sensor 217, about 89.0529°E, 22.1286°N).
- **Clearing the selected alarm** does not stop tracking or deselect it in the Slew TI window.
- **Auto mode, different zones:** the drone is redirected to the newest alarm.
- Most sensors in the database are old data from earlier sites; only **Radar 161** and **TI 217** are at the Sundarbans site.
