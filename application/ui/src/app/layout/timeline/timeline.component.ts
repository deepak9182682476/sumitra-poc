import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { AlarmService } from './../../services/alarm.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimelineComponent implements OnInit {

  alarmTimelineData = [];
  loadingInfo = {
    gettingAlarmTimelineData: false,
  };

  constructor(public alarmService: AlarmService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.loadingInfo.gettingAlarmTimelineData = true;
    this.getAlarmTimeline();
  }

  // Get Alarm Timeline
  getAlarmTimeline(): void {
    const getFilterData = localStorage.getItem('postAnalysisFilter');
    if (getFilterData) {
      const formattedData = JSON.parse(getFilterData);
      if (formattedData.zoneId === 'All') {
        formattedData.zoneId = '';
      }
      if (formattedData.alarmId === 'All') {
        formattedData.alarmId = '';
      }
      this.alarmService.getAlarmTimelineInfo('filter', formattedData).subscribe(
        (res) => {
          this.loadingInfo.gettingAlarmTimelineData = false;
          if (!res.error && !res.errorInfo) {           
            var result = [];
            res.data.forEach(function (hash) {
              return function (a) {
                if (!hash[a.alarm_id]) {
                  hash[a.alarm_id] = {
                    alarm_id: a.alarm_id, id: a.id, alarmmsg_time: a.alarmmsg_time, alarm_type: a.alarm_type, event_id: a.event_id,
                    camera_id: a.camera_id, location: a.location, sensors_triggered: a.sensors_triggered, object_identified: a.object_identified, zone_id: a.zone_id,
                    alarm_priority: a.alarm_priority, alarm_events: []
                  };
                  result.push(hash[a.alarm_id]);
                }
                hash[a.alarm_id].alarm_events.push({ event_type: a.event_type, timeofevent: a.timeofevent, event_location: a.event_location });
              };
            }(Object.create(null)));
            this.alarmTimelineData = result;
          }
        },
        (err) => {
          this.loadingInfo.gettingAlarmTimelineData = false;
        });
    }
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }
}
