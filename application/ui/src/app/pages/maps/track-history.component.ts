import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { config } from "../../../config/config";
import { isValidTrackId } from "../../shared/track-id";
import * as XLSX from "xlsx";
import { AlarmActionService, ActionCategory, AlarmActionSummary } from "../../services/alarm-action.service";

// Track History dashboard: every radar track sighting saved by the backend (table track_points).
// Shows summary cards, an interactive tracks-per-hour chart and a table; clicking a row draws that track's path on the map.
// Export: CSV, Excel (.xlsx) and PDF.
@Component({
  selector: "app-track-history",
  templateUrl: "./track-history.component.html",
  styleUrls: ["./track-history.component.scss"],
})
export class TrackHistoryComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() showPath = new EventEmitter<{ track: any; points: any[] }>();
  @Output() clearPath = new EventEmitter<void>();

  // datetime-local values (local time)
  from = "";
  to = "";
  trackId = "";
  range: "1h" | "24h" | "7d" | "custom" = "24h";

  loading = false;
  maximized = false;
  error = "";
  tracks: any[] = [];
  filteredTracks: any[] = [];       // tracks visible in the table (bar-filter applied)
  selectedKey = "";
  pointsLoading = "";
  bars: { label: string; count: number; title: string; from: number; to: number }[] = [];
  barMax = 1;
  stats = { tracks: 0, active: 0, points: 0, longest: 0, avgDuration: 0, longestId: "", farthest: 0 };

  // Interactive bar chart state
  hoveredBar = -1;
  selectedBar: string = null;       // label of clicked bar, null = show all

  // Export dropdown
  exportMenuOpen = false;
  rowExportOpen: string = null;  // key of the row whose export dropdown is open

  // ---------- Edge resize ----------
  isResizing = false;
  private resizeDir = '';
  private resizeStartX = 0;
  private resizeStartY = 0;
  private startRect = { top: 0, left: 0, width: 0, height: 0 };
  private readonly MIN_W = 400;
  private readonly MIN_H = 260;

  private get api(): string {
    // same backend as the rest of the app: http://<SERVER_IP>:3058/api/tracks
    return String(config.serverApiUrl.map).replace(/\/map$/, "/tracks");
  }

  constructor(private http: HttpClient, private actions: AlarmActionService) {}

  // ---------- Alarm action pie chart (recorded in this browser only) ----------
  pieOpen = false;
  pieCounts: { [category: string]: number } = {};
  pieAlarms: AlarmActionSummary[] = [];
  pieHover: string | null = null;
  pieSelected: string | null = null;
  private pieTimer: any = null;

  readonly pieKeys: ActionCategory[] = ["ack", "ack_uav", "ack_home", "ack_uav_home", "ack_uav_home_cancel", "ack_uav_cancel", "none", "other"];
  readonly pieLabels: { [k: string]: string } = {
    ack: "Acknowledged only",
    ack_uav: "Acknowledged + UAV",
    ack_home: "Acknowledged + Home",
    ack_uav_home: "Acknowledged + UAV + Home",
    ack_uav_home_cancel: "Acknowledged + UAV + Home + Cancelled",
    ack_uav_cancel: "Acknowledged + UAV + Cancelled",
    none: "No action",
    other: "Other",
  };
  readonly pieColors: { [k: string]: string } = {
    ack: "#34a853",
    ack_uav: "#7b4fd6",
    ack_home: "#e67e22",
    ack_uav_home: "#1a73e8",
    ack_uav_home_cancel: "#d93025",
    ack_uav_cancel: "#c2185b",
    none: "#8e8e93",
    other: "#8d6e63",
  };
  readonly actionNames: { [k: string]: string } = {
    seen: "Raised",
    ack: "Acknowledged",
    reject: "Cancelled",
    uav: "UAV",
    home: "Home",
    done: "Done",
  };

  togglePie(): void {
    this.pieOpen = !this.pieOpen;
    if (this.pieOpen) {
      this.refreshPie();
      // keep the chart live while it is open
      this.pieTimer = setInterval(() => this.refreshPie(), 2000);
    } else {
      this.stopPieTimer();
      this.pieHover = null;
      this.pieSelected = null;
    }
  }

  ngOnDestroy(): void {
    this.stopPieTimer();
  }

  private stopPieTimer(): void {
    if (this.pieTimer) { clearInterval(this.pieTimer); this.pieTimer = null; }
  }

  // Preset ranges (1h / 24h / 7d) always end at "now", so actions done after the panel opened are counted.
  private pieWindow(): { f: number; t: number } {
    const hours: { [k: string]: number } = { "1h": 1, "24h": 24, "7d": 168 };
    if (hours[this.range]) {
      const now = Date.now();
      return { f: now - hours[this.range] * 3600 * 1000, t: now };
    }
    return { f: new Date(this.from).getTime(), t: new Date(this.to).getTime() };
  }

  get pieRangeText(): string {
    const names: { [k: string]: string } = { "1h": "last 1 hour", "24h": "last 24 hours", "7d": "last 7 days" };
    return names[this.range] || "custom range";
  }

  refreshPie(): void {
    const w = this.pieWindow();
    if (isNaN(w.f) || isNaN(w.t)) { this.pieCounts = {}; this.pieAlarms = []; return; }
    this.pieAlarms = this.actions.alarmsBetween(w.f, w.t);
    const counts: { [category: string]: number } = {};
    this.pieKeys.forEach((k) => (counts[k] = 0));
    this.pieAlarms.forEach((a) => counts[a.category]++);
    this.pieCounts = counts;
    if (this.pieSelected && !this.pieCounts[this.pieSelected]) this.pieSelected = null;
  }

  selectSlice(key: string): void {
    if (!this.pieCounts[key]) return;
    this.pieSelected = this.pieSelected === key ? null : key;
  }

  hoverSlice(key: string | null): void {
    this.pieHover = key && this.pieCounts[key] ? key : null;
  }

  isDim(key: string): boolean {
    const focus = this.pieHover || this.pieSelected;
    return !!focus && focus !== key;
  }

  isPopped(key: string): boolean {
    return this.pieHover === key || this.pieSelected === key;
  }

  // Legend rows: every group, except "Other" which only shows when it has alarms
  get legendSlices() {
    return this.pieSlices.filter((sl) => sl.key !== "other" || sl.count > 0);
  }

  get pieTotal(): number {
    return this.pieKeys.reduce((sum, k) => sum + (this.pieCounts[k] || 0), 0);
  }

  get centerNumber(): number {
    const focus = this.pieHover || this.pieSelected;
    return focus ? this.pieCounts[focus] || 0 : this.pieTotal;
  }

  get centerLabel(): string {
    const focus = this.pieHover || this.pieSelected;
    if (!focus) return this.pieTotal === 1 ? "alarm" : "alarms";
    const total = this.pieTotal;
    return Math.round(((this.pieCounts[focus] || 0) / (total || 1)) * 100) + "%";
  }

  get selectedAlarms(): AlarmActionSummary[] {
    return this.pieSelected ? this.pieAlarms.filter((a) => a.category === this.pieSelected) : [];
  }

  // Donut slices (outer radius 64, inner radius 38) drawn as SVG paths
  get pieSlices(): { key: string; label: string; color: string; count: number; pct: number; path: string; pop: string }[] {
    const total = this.pieTotal;
    const c = 80, R = 64, r = 38;
    let angle = -Math.PI / 2; // start at 12 o'clock
    const pt = (rad: number, a: number) => (c + rad * Math.cos(a)).toFixed(2) + " " + (c + rad * Math.sin(a)).toFixed(2);
    return this.pieKeys.map((k) => {
      const count = this.pieCounts[k] || 0;
      const frac = total ? count / total : 0;
      const a0 = angle;
      const a1 = angle + frac * 2 * Math.PI;
      angle = a1;
      let path = "";
      if (frac >= 0.9999) {
        // full ring: outer circle + inner circle (cut out with evenodd)
        path = `M ${c} ${c - R} A ${R} ${R} 0 1 1 ${c} ${c + R} A ${R} ${R} 0 1 1 ${c} ${c - R} Z ` +
               `M ${c} ${c - r} A ${r} ${r} 0 1 0 ${c} ${c + r} A ${r} ${r} 0 1 0 ${c} ${c - r} Z`;
      } else if (frac > 0) {
        const large = frac > 0.5 ? 1 : 0;
        path = `M ${pt(R, a0)} A ${R} ${R} 0 ${large} 1 ${pt(R, a1)} L ${pt(r, a1)} A ${r} ${r} 0 ${large} 0 ${pt(r, a0)} Z`;
      }
      const mid = (a0 + a1) / 2;
      const pop = `translate(${(6 * Math.cos(mid)).toFixed(2)} ${(6 * Math.sin(mid)).toFixed(2)})`;
      return { key: k, label: this.pieLabels[k], color: this.pieColors[k], count, pct: Math.round(frac * 100), path, pop };
    });
  }

  ngOnInit(): void {
    this.quick("24h");
  }

  // Close export menus when clicking outside
  @HostListener("document:click", ["$event"])
  onDocClick(ev: Event) {
    const el = ev.target as HTMLElement;
    if (!el.closest(".th-export-menu")) this.exportMenuOpen = false;
    if (!el.closest(".th-row-export")) this.rowExportOpen = null;
  }

  toggleRowExport(key: string, ev: Event) {
    ev.stopPropagation();
    this.rowExportOpen = this.rowExportOpen === key ? null : key;
  }

  // ---------- filters ----------
  onRange(v: string) {
    if (v === "1h" || v === "24h" || v === "7d") this.quick(v);
    else this.range = "custom";
  }

  quick(r: "1h" | "24h" | "7d") {
    this.range = r;
    const hours = r === "1h" ? 1 : r === "24h" ? 24 : 24 * 7;
    const now = new Date();
    this.to = this.toLocalInput(now);
    this.from = this.toLocalInput(new Date(now.getTime() - hours * 3600 * 1000));
    this.load();
  }

  load() {
    const from = new Date(this.from), to = new Date(this.to);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) { this.error = "Please choose valid From / To times."; return; }
    if (from > to) { this.error = "From must be before To."; return; }
    this.refreshPie();
    this.error = "";
    this.loading = true;
    this.selectedBar = null;
    const params: any = { from: from.toISOString(), to: to.toISOString(), limit: "1000" };
    if (String(this.trackId).trim()) params.track_id = String(this.trackId).trim();
    this.http.get(this.api + "/summary", { params }).subscribe(
      (res: any) => {
        this.loading = false;
        this.tracks = ((res && res.tracks) || []).filter((t: any) => isValidTrackId(t && t.track_id)); // ID 0 never shown
        this.computeStats();
        this.computeBars(from, to);
        this.applyBarFilter();
        if (this.selectedKey && !this.tracks.some((t) => this.key(t) === this.selectedKey)) this.unselect();
      },
      (err) => {
        this.loading = false;
        this.tracks = [];
        this.filteredTracks = [];
        this.computeStats();
        this.bars = [];
        this.error = err && err.status ? "Server error (" + err.status + ") while reading track history." : "Backend not reachable - is the server running?";
      }
    );
  }

  // ---------- interactive bar chart ----------
  onBarClick(b: { label: string; count: number }) {
    if (this.selectedBar === b.label) {
      this.selectedBar = null;  // toggle off
    } else {
      this.selectedBar = b.label;
    }
    this.applyBarFilter();
  }

  clearBarFilter() {
    this.selectedBar = null;
    this.applyBarFilter();
  }

  private applyBarFilter() {
    if (!this.selectedBar) {
      this.filteredTracks = this.tracks;
      return;
    }
    // find the bar's time range
    const bar = this.bars.find((b) => b.label === this.selectedBar);
    if (!bar) { this.filteredTracks = this.tracks; return; }
    this.filteredTracks = this.tracks.filter((t) => {
      const ts = new Date(t.first_seen).getTime();
      return ts >= bar.from && ts < bar.to;
    });
  }

  // ---------- table actions ----------
  key(t: any): string { return t.track_id + "|" + t.first_seen; }

  select(t: any) {
    const k = this.key(t);
    if (this.selectedKey === k) { this.unselect(); return; }
    this.maximized = false; // back to normal size so the path on the map is visible
    this.selectedKey = k;
    this.pointsLoading = k;
    this.fetchPoints(t, (pts) => {
      this.pointsLoading = "";
      if (this.selectedKey === k) this.showPath.emit({ track: t, points: pts });
    });
  }

  unselect() {
    this.selectedKey = "";
    this.clearPath.emit();
  }

  private fetchPoints(t: any, done: (pts: any[]) => void) {
    const params = { track_id: String(t.track_id), from: t.first_seen, to: t.last_seen };
    this.http.get(this.api + "/points", { params }).subscribe(
      (res: any) => done((res && res.points) || []),
      () => { this.pointsLoading = ""; this.error = "Could not load the points of track " + t.track_id + "."; }
    );
  }

  // ---------- export ----------
  doExport(format: "csv" | "excel" | "pdf") {
    this.exportMenuOpen = false;
    if (format === "csv") this.exportCsv();
    else if (format === "excel") this.exportExcel();
    else if (format === "pdf") this.exportPdf();
  }

  exportCsv() {
    const head = ["track_id", "first_seen", "last_seen", "duration_s", "points", "distance_m", "start_lat", "start_lon", "end_lat", "end_lon", "max_speed", "avg_speed", "min_range_km", "max_range_km"];
    const rows = this.tracks.map((t) => head.map((h) => this.csvCell(t[h])).join(","));
    this.downloadBlob("track_history_" + this.stamp() + ".csv", new Blob([head.join(",") + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8" }));
  }

  exportExcel() {
    const head = ["Track ID", "First Seen", "Last Seen", "Duration (s)", "Positions", "Distance (m)", "Start Lat", "Start Lon", "End Lat", "End Lon", "Max Speed", "Avg Speed", "Min Range km", "Max Range km"];
    const keys = ["track_id", "first_seen", "last_seen", "duration_s", "points", "distance_m", "start_lat", "start_lon", "end_lat", "end_lon", "max_speed", "avg_speed", "min_range_km", "max_range_km"];
    const data = this.tracks.map((t) => keys.map((k) => t[k] !== null && t[k] !== undefined ? t[k] : ""));
    const ws = XLSX.utils.aoa_to_sheet([head, ...data]);
    // Auto column widths
    ws["!cols"] = head.map((h, i) => ({ wch: Math.max(h.length, ...data.map((r) => String(r[i] || "").length).slice(0, 20)) + 2 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Track History");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    this.downloadBlob("track_history_" + this.stamp() + ".xlsx", new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  }

  exportPdf() {
    // Generate a clean HTML table and open print dialog (Save as PDF)
    const head = ["Track ID", "First Seen", "Last Seen", "Duration", "Positions", "Distance", "Max Speed"];
    const rows = this.tracks.map((t) =>
      "<tr>" +
      "<td>" + (t.track_id || "") + "</td>" +
      "<td>" + this.time(t.first_seen) + "</td>" +
      "<td>" + (t.active ? "Live" : this.time(t.last_seen)) + "</td>" +
      "<td>" + this.dur(t.duration_s) + "</td>" +
      "<td>" + (t.points || 0) + "</td>" +
      "<td>" + this.dist(t.distance_m) + "</td>" +
      "<td>" + this.n1(t.max_speed) + "</td>" +
      "</tr>"
    ).join("");

    const html = `<!DOCTYPE html><html><head><title>Track History - SUMITRA</title>
<style>
body{font-family:Arial,sans-serif;margin:20px;color:#222}
h2{margin:0 0 4px;font-size:18px}
.sub{color:#666;font-size:12px;margin-bottom:12px}
.stats{margin-bottom:10px;font-size:13px}
.stats b{margin-right:16px}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:#2464ac;color:#fff;padding:6px 8px;text-align:left}
td{padding:5px 8px;border-bottom:1px solid #ddd}
tr:nth-child(even) td{background:#f7f7f7}
.footer{margin-top:14px;font-size:10px;color:#888}
</style></head><body>
<h2>SUMITRA - Track History Report</h2>
<div class="sub">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Range: ${this.from} to ${this.to}</div>
<div class="stats">
  <b>Tracks: ${this.stats.tracks}</b>
  <b>Live: ${this.stats.active}</b>
  <b>Total Positions: ${this.stats.points}</b>
  <b>Avg Duration: ${this.dur(this.stats.avgDuration)}</b>
  <b>Longest: ${this.dur(this.stats.longest)}</b>
</div>
<table><thead><tr>${head.map((h) => "<th>" + h + "</th>").join("")}</tr></thead><tbody>${rows}</tbody></table>
<div class="footer">SUMITRA Border Security System</div>
</body></html>`;

    const w = window.open("", "_blank", "width=900,height=700");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => { w.print(); }, 400);
    }
  }

  exportPoints(t: any, ev: Event, format: "csv" | "excel" | "pdf" = "csv") {
    ev.stopPropagation();
    this.rowExportOpen = null;
    const head = ["ts", "latitude", "longitude", "range_km", "azimuth", "speed", "heading", "source"];
    const headLabels = ["Timestamp", "Latitude", "Longitude", "Range (km)", "Azimuth", "Speed", "Heading", "Source"];
    const fileBase = "track_" + t.track_id + "_" + this.stamp(new Date(t.first_seen));

    this.fetchPoints(t, (pts) => {
      if (format === "csv") {
        const rows = pts.map((p) => head.map((h) => this.csvCell(p[h])).join(","));
        this.downloadBlob(fileBase + ".csv",
          new Blob([head.join(",") + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8" }));

      } else if (format === "excel") {
        const data = pts.map((p) => head.map((k) => p[k] !== null && p[k] !== undefined ? p[k] : ""));
        const ws = XLSX.utils.aoa_to_sheet([headLabels, ...data]);
        ws["!cols"] = headLabels.map((h, i) => ({ wch: Math.max(h.length, ...data.slice(0, 20).map((r) => String(r[i] || "").length)) + 2 }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Track " + t.track_id);
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        this.downloadBlob(fileBase + ".xlsx",
          new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));

      } else if (format === "pdf") {
        const rows = pts.map((p) =>
          "<tr>" + head.map((h) => "<td>" + (p[h] !== null && p[h] !== undefined ? p[h] : "") + "</td>").join("") + "</tr>"
        ).join("");
        const html = `<!DOCTYPE html><html><head><title>Track ${t.track_id} Positions</title>
<style>
body{font-family:Arial,sans-serif;margin:20px;color:#222}
h2{margin:0 0 4px;font-size:18px}
.sub{color:#666;font-size:12px;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:11px}
th{background:#2464ac;color:#fff;padding:5px 6px;text-align:left}
td{padding:4px 6px;border-bottom:1px solid #ddd}
tr:nth-child(even) td{background:#f7f7f7}
.footer{margin-top:14px;font-size:10px;color:#888}
</style></head><body>
<h2>Track ${t.track_id} — Position History</h2>
<div class="sub">First seen: ${this.time(t.first_seen)} &nbsp;|&nbsp; Last seen: ${this.time(t.last_seen)} &nbsp;|&nbsp; Positions: ${pts.length}</div>
<table><thead><tr>${headLabels.map((h) => "<th>" + h + "</th>").join("")}</tr></thead><tbody>${rows}</tbody></table>
<div class="footer">SUMITRA Border Security System</div>
</body></html>`;
        const w = window.open("", "_blank", "width=900,height=700");
        if (w) { w.document.write(html); w.document.close(); setTimeout(() => { w.print(); }, 400); }
      }
    });
  }

  // ---------- formatting ----------
  dur(s: number): string {
    s = Math.round(Number(s) || 0);
    if (s < 60) return s + "s";
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h ? h + "h " + m + "m" : m + "m " + sec + "s";
  }
  dist(m: number): string {
    m = Number(m) || 0;
    return m >= 1000 ? (m / 1000).toFixed(2) + " km" : Math.round(m) + " m";
  }
  time(v: string): string {
    const d = new Date(v);
    if (isNaN(d.getTime())) return "-";
    const p = (n: number) => (n < 10 ? "0" : "") + n;
    const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    return p(d.getDate()) + " " + mon + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }
  n1(v: any): string { return v === null || v === undefined || isNaN(Number(v)) ? "-" : Number(v).toFixed(1); }
  coord(lat: any, lon: any): string {
    return lat === null || lat === undefined ? "-" : Number(lat).toFixed(5) + ", " + Number(lon).toFixed(5);
  }

  // ---------- internals ----------
  private computeStats() {
    const t = this.tracks;
    const longest = t.reduce((a, x) => (x.duration_s > (a ? a.duration_s : -1) ? x : a), null);
    this.stats = {
      tracks: t.length,
      active: t.filter((x) => x.active).length,
      points: t.reduce((s, x) => s + (Number(x.points) || 0), 0),
      longest: longest ? longest.duration_s : 0,
      longestId: longest ? String(longest.track_id) : "",
      avgDuration: t.length ? t.reduce((s, x) => s + (Number(x.duration_s) || 0), 0) / t.length : 0,
      farthest: t.reduce((m, x) => Math.max(m, Number(x.distance_m) || 0), 0),
    };
  }

  // tracks started per hour (range up to 2 days) or per day (longer ranges)
  private computeBars(from: Date, to: Date) {
    const spanH = (to.getTime() - from.getTime()) / 3600000;
    const byDay = spanH > 48;
    const step = byDay ? 24 * 3600000 : 3600000;
    const start = new Date(from);
    if (byDay) start.setHours(0, 0, 0, 0); else start.setMinutes(0, 0, 0);
    const buckets: { t: number; count: number }[] = [];
    for (let t = start.getTime(); t <= to.getTime() && buckets.length < 60; t += step) buckets.push({ t, count: 0 });
    this.tracks.forEach((x) => {
      const i = Math.floor((new Date(x.first_seen).getTime() - start.getTime()) / step);
      if (i >= 0 && i < buckets.length) buckets[i].count++;
    });
    const p = (n: number) => (n < 10 ? "0" : "") + n;
    this.bars = buckets.map((b) => {
      const d = new Date(b.t);
      const label = byDay ? p(d.getDate()) + "/" + p(d.getMonth() + 1) : p(d.getHours()) + ":00";
      return { label, count: b.count, title: label + " - " + b.count + " track" + (b.count === 1 ? "" : "s"), from: b.t, to: b.t + step };
    });
    this.barMax = Math.max(1, ...this.bars.map((b) => b.count));
  }

  barLabelEvery(): number { return Math.max(1, Math.ceil(this.bars.length / 8)); }

  private toLocalInput(d: Date): string {
    const p = (n: number) => (n < 10 ? "0" : "") + n;
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  private stamp(d = new Date()): string {
    const p = (n: number) => (n < 10 ? "0" : "") + n;
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "_" + p(d.getHours()) + p(d.getMinutes());
  }
  private csvCell(v: any): string {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  private downloadBlob(name: string, blob: Blob) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ---------- Edge / corner resize ----------
  startResize(event: MouseEvent, dir: string) {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.resizeDir = dir;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    const panel = (event.target as HTMLElement).closest('.th-panel') as HTMLElement;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    this.startRect = { top: r.top, left: r.left, width: r.width, height: r.height };
  }

  @HostListener('document:mousemove', ['$event'])
  onResizeMove(event: MouseEvent) {
    if (!this.isResizing) return;
    event.preventDefault();
    const dx = event.clientX - this.resizeStartX;
    const dy = event.clientY - this.resizeStartY;
    const dir = this.resizeDir;
    const s = this.startRect;
    let newTop = s.top, newLeft = s.left, newW = s.width, newH = s.height;
    if (dir.includes('e')) { newW = Math.max(this.MIN_W, s.width + dx); }
    if (dir.includes('w')) { newW = Math.max(this.MIN_W, s.width - dx); newLeft = s.left + (s.width - newW); }
    if (dir.includes('s')) { newH = Math.max(this.MIN_H, s.height + dy); }
    if (dir.includes('n')) { newH = Math.max(this.MIN_H, s.height - dy); newTop = s.top + (s.height - newH); }
    const panel = document.querySelector('.th-panel') as HTMLElement;
    if (!panel) return;
    panel.style.width = newW + 'px';
    panel.style.height = newH + 'px';
    panel.style.top = newTop + 'px';
    panel.style.left = newLeft + 'px';
    panel.style.right = 'auto';
    panel.style.maxWidth = 'none';
    panel.style.maxHeight = 'none';
  }

  @HostListener('document:mouseup')
  onResizeEnd() {
    if (this.isResizing) {
      this.isResizing = false;
      this.resizeDir = '';
    }
  }
}
