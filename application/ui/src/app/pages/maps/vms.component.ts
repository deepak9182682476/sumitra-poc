import { Component, EventEmitter, Output, OnDestroy, ViewChildren, QueryList, ElementRef, AfterViewInit, HostListener } from "@angular/core";
import { stream_urls } from "../../../config/config";

// VMS streams configuration.
// type: 'mjpeg' = <img src="url"> (existing camera streams)
//       'hls'   = <video> + HLS.js from MediaMTX server (reduces camera load)
// When MediaMTX is set up, change the URLs to point at it and set type to 'hls'.
interface VmsFeed {
  label: string;
  url: string;
  type: "mjpeg" | "hls";
}

// VMS — Video Management System: 2x2 tile grid showing all camera feeds at once.
// - 3 real camera tiles (Day, Thermal, UAV) + 1 blank spare tile
// - Each tile: play / pause / enlarge
// - Fullscreen button for the whole grid
@Component({
  selector: "app-vms",
  templateUrl: "./vms.component.html",
  styleUrls: ["./vms.component.scss"],
})
export class VmsComponent implements AfterViewInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @ViewChildren("videoEl") videoEls: QueryList<ElementRef>;

  maximized = false;       // fullscreen the whole grid
  enlargedIdx: number = -1; // -1 = all tiles, 0-3 = that tile fills the panel

  feeds: VmsFeed[] = [
    { label: "Day Camera", url: (stream_urls as any).DAY || "", type: this.detectType((stream_urls as any).DAY) },
    { label: "Thermal Camera", url: (stream_urls as any).THERMAL || "", type: this.detectType((stream_urls as any).THERMAL) },
    { label: "UAV Camera", url: (stream_urls as any).UAV || "", type: this.detectType((stream_urls as any).UAV) },
    { label: "Camera 4", url: "", type: "mjpeg" },
  ];

  // Per-tile state
  playing: boolean[] = [true, true, true, false];
  errors: boolean[] = [false, false, false, false];

  // ---------- Edge resize ----------
  isResizing = false;
  private resizeDir = '';
  private resizeStartX = 0;
  private resizeStartY = 0;
  private startRect = { top: 0, left: 0, width: 0, height: 0 };
  private readonly MIN_W = 360;
  private readonly MIN_H = 260;

  // HLS.js instances (loaded dynamically, so no build-time dependency)
  private hlsInstances: any[] = [null, null, null, null];
  private hlsLib: any = null;

  ngAfterViewInit() {
    // Start HLS feeds after DOM is ready
    setTimeout(() => this.initHlsFeeds(), 100);
  }

  ngOnDestroy() {
    this.destroyAllHls();
  }

  // Auto-detect stream type from URL
  private detectType(url: string): "mjpeg" | "hls" {
    if (!url) return "mjpeg";
    if (/\.m3u8/i.test(url) || /mediamtx/i.test(url)) return "hls";
    return "mjpeg";
  }

  // ---------- HLS ----------
  private async initHlsFeeds() {
    for (let i = 0; i < this.feeds.length; i++) {
      if (this.feeds[i].type === "hls" && this.feeds[i].url && this.playing[i]) {
        await this.startHls(i);
      }
    }
  }

  private async loadHlsLib(): Promise<any> {
    if (this.hlsLib) return this.hlsLib;
    try {
      // Dynamic import — hls.js is optional; install with: npm i hls.js
      // Use Function constructor to prevent webpack from resolving at build time
      const loader = new Function("return import('hls.js')");
      const m = await loader();
      this.hlsLib = m.default || m;
      return this.hlsLib;
    } catch (e) {
      console.warn("VMS: hls.js not installed — HLS streams will not play. Run: npm i hls.js");
      return null;
    }
  }

  private async startHls(idx: number) {
    this.destroyHls(idx);
    const Hls = await this.loadHlsLib();
    if (!Hls || !Hls.isSupported || !Hls.isSupported()) return;
    const videoEl = this.getVideoEl(idx);
    if (!videoEl) return;
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(this.feeds[idx].url);
    hls.attachMedia(videoEl);
    hls.on(Hls.Events.ERROR, (_: any, data: any) => {
      if (data.fatal) { this.errors[idx] = true; }
    });
    this.hlsInstances[idx] = hls;
  }

  private destroyHls(idx: number) {
    if (this.hlsInstances[idx]) {
      this.hlsInstances[idx].destroy();
      this.hlsInstances[idx] = null;
    }
  }

  private destroyAllHls() {
    for (let i = 0; i < 4; i++) this.destroyHls(i);
  }

  private getVideoEl(idx: number): HTMLVideoElement | null {
    if (!this.videoEls) return null;
    const arr = this.videoEls.toArray();
    // Find the video element for this tile index
    const el = arr.find((e) => e.nativeElement.dataset.idx === String(idx));
    return el ? el.nativeElement : null;
  }

  // ---------- Tile controls ----------
  togglePlay(idx: number) {
    if (!this.feeds[idx].url) return;
    this.playing[idx] = !this.playing[idx];
    if (this.feeds[idx].type === "hls") {
      if (this.playing[idx]) {
        this.startHls(idx);
      } else {
        this.destroyHls(idx);
      }
    }
    // For MJPEG: toggling the [src] in the template handles play/pause
  }

  enlarge(idx: number) {
    this.enlargedIdx = this.enlargedIdx === idx ? -1 : idx;
  }

  onFeedError(idx: number) {
    this.errors[idx] = true;
  }

  toggleFullscreen() {
    this.maximized = !this.maximized;
  }

  // Tile visibility: which tiles to show
  get visibleTiles(): number[] {
    if (this.enlargedIdx >= 0) return [this.enlargedIdx];
    return [0, 1, 2, 3];
  }

  isVisible(idx: number): boolean {
    return this.enlargedIdx < 0 || this.enlargedIdx === idx;
  }

  // ---------- Edge / corner resize ----------
  startResize(event: MouseEvent, dir: string) {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.resizeDir = dir;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;

    const panel = (event.target as HTMLElement).closest('.vms-panel') as HTMLElement;
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

    const panel = document.querySelector('.vms-panel') as HTMLElement;
    if (!panel) return;
    panel.style.width  = newW + 'px';
    panel.style.height = newH + 'px';
    panel.style.top    = newTop + 'px';
    panel.style.left   = newLeft + 'px';
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
