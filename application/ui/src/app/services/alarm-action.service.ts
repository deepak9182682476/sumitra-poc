// Put this file in: application/ui/src/app/services/alarm-action.service.ts
// Remembers what the operator did to each alarm (ack, cancel, UAV, home).
// POC: stored in this browser's localStorage only (not shared, lost if storage is cleared).
import { Injectable } from "@angular/core";

export type AlarmAction = "seen" | "ack" | "reject" | "uav" | "home" | "done";  // "seen" = alarm appeared (no action yet)

export type ActionCategory =
  | "ack"                   // acknowledged only
  | "ack_uav"               // acknowledged + UAV
  | "ack_home"              // acknowledged + Home
  | "ack_uav_home"          // acknowledged + UAV + Home
  | "ack_uav_home_cancel"   // acknowledged + UAV + Home + Cancelled
  | "ack_uav_cancel"        // acknowledged + UAV + Cancelled
  | "none"                  // no action
  | "other";                // any other mix (e.g. cancelled without UAV), so nothing is lost

export interface ActionEntry {
  action: AlarmAction;
  at: number;   // epoch ms
  no?: any;     // alarm number shown on the card (e.g. 4810)
}

export interface AlarmActionSummary {
  alarmId: string;   // key used by the sidebar (the track ID)
  alarmNo: any;      // alarm number shown on the card
  category: ActionCategory;
  entries: ActionEntry[];
}

type ActionStore = { [alarmId: string]: ActionEntry[] };

const STORAGE_KEY = "sumitra_alarm_actions";

@Injectable({ providedIn: "root" })
export class AlarmActionService {
  private read(): ActionStore {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  private write(data: ActionStore): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // storage blocked or full: keep working without history
    }
  }

  /**
   * Record an action on an alarm. Each action is kept once per alarm (first time wins).
   * atMs: optional time of the action (used for "seen" = the alarm's own time); default now.
   */
  record(alarmId: any, action: AlarmAction, alarmNo?: any, atMs?: number): void {
    if (alarmId === null || alarmId === undefined || alarmId === "") return;
    const key = String(alarmId);
    const data = this.read();
    const entries = data[key] || [];
    if (!entries.some((e) => e.action === action)) {
      const entry: ActionEntry = { action, at: atMs && !isNaN(atMs) ? atMs : Date.now() };
      if (alarmNo !== null && alarmNo !== undefined && alarmNo !== "") entry.no = alarmNo;
      entries.push(entry);
    }
    data[key] = entries;
    this.write(data);
  }

  /** Category of one alarm, from all of its recorded actions. */
  categoryOf(alarmId: any): ActionCategory {
    return this.categoryFrom(this.read()[String(alarmId)] || []);
  }

  /**
   * Alarms that had an action between fromMs and toMs, with their category.
   * The category uses ALL actions of that alarm, so an alarm acknowledged before the
   * range and sent home inside it still counts as "Acknowledged + Home".
   */
  alarmsBetween(fromMs: number, toMs: number): AlarmActionSummary[] {
    const data = this.read();
    const out: AlarmActionSummary[] = [];
    Object.keys(data).forEach((alarmId) => {
      const entries = (data[alarmId] || []).slice().sort((a, b) => a.at - b.at);
      if (!entries.some((e) => e.at >= fromMs && e.at <= toMs)) return;
      const withNo = entries.find((e) => e.no !== undefined && e.no !== null);
      out.push({
        alarmId,
        alarmNo: withNo ? withNo.no : null,
        category: this.categoryFrom(entries),
        entries,
      });
    });
    return out.sort((a, b) => b.entries[b.entries.length - 1].at - a.entries[a.entries.length - 1].at);
  }

  /** Counts per category for alarms that had an action between fromMs and toMs. */
  countsBetween(fromMs: number, toMs: number): { [category: string]: number } {
    const counts: { [category: string]: number } = {
      ack: 0, ack_uav: 0, ack_home: 0, ack_uav_home: 0, ack_uav_home_cancel: 0, ack_uav_cancel: 0, none: 0, other: 0,
    };
    this.alarmsBetween(fromMs, toMs).forEach((a) => counts[a.category]++);
    return counts;
  }

  private categoryFrom(entries: ActionEntry[]): ActionCategory {
    const has = (a: AlarmAction) => entries.some((e) => e.action === a);
    const uav = has("uav"), home = has("home"), cancel = has("reject");
    if (uav && home && cancel) return "ack_uav_home_cancel";
    if (uav && cancel) return "ack_uav_cancel";
    if (uav && home) return "ack_uav_home";
    if (uav) return "ack_uav";
    if (home && !cancel) return "ack_home";
    if (cancel || has("done")) return "other";   // cancelled without UAV, or done
    if (has("ack")) return "ack";
    return "none";
  }
}
