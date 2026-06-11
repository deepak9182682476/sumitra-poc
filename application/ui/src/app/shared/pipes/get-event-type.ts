import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'geAlarmEventType',
  pure: true
})
export class GeAlarmEventTypePipe implements PipeTransform {

  public transform(value: number, args?: any): any {  
    return this.geAlarmEventType(value);
  }

  geAlarmEventType(id: any): any {
    const event_types = [
      {
        event_id: 0,
        event_name: "No Action",
        translation_event_key: "no_action"
      },
      {
        event_id: 1,
        event_name: "Acknowledged",
        translation_event_key: "acknowledged"
      },
      {
        event_id: 2,
        event_name: "Cleared",
        translation_event_key: "cleared"
      },
      {
        event_id: 3,
        event_name: "UGV Assigned",
        translation_event_key: "UGV_assigned"
      },
      {
        event_id: 4,
        event_name: "UGV Stopped",
        translation_event_key: "UGV_stopped"
      },
      {
        event_id: 5,
        event_name: "UAV Assigned",
        translation_event_key: "UAV_assigned"
      },
      {
        event_id: 6,
        event_name: "UAV Stopped",
        translation_event_key: "UAV_stopped"
      },
      {
        event_id: 7,
        event_name: "EOIR Assigned",
        translation_event_key: "EOIR_assigned"
      },
      {
        event_id: 8,
        event_name: "EOIR Stopped",
        translation_event_key: "EOIR_stopped"
      },
      {
        event_id: 9,
        event_name: "Slew TI Started",
        translation_event_key: "Slew_TI_started"
      },
      {
        event_id: 10,
        event_name: "Slew TI Stopped",
        translation_event_key: "Slew_TI_stopped"
      },
      {
        event_id: 11,
        event_name: "QRT Assigned",
        translation_event_key: "QRT_assigned"
      },
      {
        event_id: 12,
        event_name: "QRT Stopped",
        translation_event_key: "QRT_stopped"
      },
      {
        event_id: 13,
        event_name: "QRT Re-assigned",
        translation_event_key: "QRT_re_assigned"
      },
      {
        event_id: 14,
        event_name: "Primary Alarm",
        translation_event_key: "prim_alarm"
      },
      {
        event_id: 15,
        event_name: "Confirmatory alarm",
        translation_event_key: "conf_alarm"
      }
    ];
    let filterValue = event_types.find(evt => {
      return (evt.event_id === id) ? evt.translation_event_key : null;
    });
    return filterValue.translation_event_key;    
  }
}
