import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PostAnalysisService } from '../../../services/post-analysis.service';
import { CommonService } from 'src/app/services/common.service';
import { server_info } from 'src/config/config';
import { AlarmService } from '../../../services/alarm.service';
import _ from "lodash";
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoComponent implements OnInit {
  postAnalysisData = [];
  isLoading = false;
  server_ip = null;
  activeTab = 'images';

  constructor(private postAnalysisService: PostAnalysisService,
    private commonService: CommonService,
    private alarmService: AlarmService,
    private http: HttpClient
  ) {
    this.server_ip = `http://${server_info.SERVER_IP}:3058/api/image/getVideo`;
  }

  ngOnInit(): void {
    const getFilterData = localStorage.getItem('postAnalysisFilter');
    this.postAnalysisFilterData(getFilterData);
  }

  /** Display Map/Graph Section */
  activateImagesVideos(tabName): void {
    this.activeTab = tabName ? 'videos' : 'images';
  }

  postAnalysisFilterData(getFilterData) {
    if (getFilterData) {
      this.isLoading = true;
      this.postAnalysisData = [];
      const formattedData = JSON.parse(getFilterData);
      if (formattedData.zoneId === 'All') {
        formattedData.zoneId = '';
      }
      if (formattedData.alarmId === 'All') {
        formattedData.alarmId = '';
      }
      this.postAnalysisService.getFilterApi('alarms').subscribe((res: any) => {
        if (res) {
          let confirmatory_alarms_respone= res.filter(rec => rec.alarm_type == 1)
          let sort_res = confirmatory_alarms_respone.sort((a,b) => b.id - a.id);
          let limit_res = sort_res.slice(0, 10);

          let data = { zone_name: '', alarms: [] };
          let arr = [];
          console.log('ressssss', JSON.stringify(confirmatory_alarms_respone));
          console.log('ressssss 1', JSON.stringify(limit_res));
         // console.log('ressssss 2', JSON.stringify(data_kkl));

          limit_res.map(async rec => {
            let time = moment(rec.alarmmsg_time).format("YYYY-MM-DDTHH:mm");
            let data_img = `${rec.alarm_id}`
            //await this.getImage('kkl');
            //this.getImage(`${rec.alarm_id}_${time}`)
            //console.log(data_img, moment(rec.alarmmsg_time).format("YYYY/MM/DDTHH:mm"));

            if (!arr.length) {
              let obj = Object.assign({}, data);
              obj.zone_name = rec.zone_id;
              obj.alarms = [{
                alarm_id: rec.alarm_id, videos: [`${rec.alarm_id}`], images: [data_img]
              }];
              arr.push(obj);
            } else {
              let idx = arr.findIndex(crec => crec.zone_name == rec.zone_id);
              if (idx !== -1) {
                arr[idx].alarms.push({
                  alarm_id: rec.alarm_id, videos: [`${rec.alarm_id}`], images: [data_img]
                })
              } else {
                let obj = Object.assign({}, data);
                obj.zone_name = rec.zone_id;
                obj.alarms = [{
                  alarm_id: rec.alarm_id, videos: [`${rec.alarm_id}`], images: [data_img]
                }];
                arr.push(obj);
              }
            }
          })
          //[{"alarm_id":"event_1123452345","alarmmsg_time":"2021-12-16T05:39:54.435Z","alarm_type":1,"event_id":"event_1123452345","camera_id":"event_1123452345","location":{"crs":{"type":"name","properties":{"name":"EPSG:4326"}},"type":"Point","coordinates":[76.53645158861788,14.387097877362908]},"sensors_triggered":["camera"],"zone_id":"19","alarm_priority":null,"id":3886,"record_flag":"1","object_identified":"person","pole_number":15},
          // {"alarm_id":"event_1","alarmmsg_time":"2021-12-15T23:41:19.926Z","alarm_type":1,"event_id":"event_1","camera_id":"event_1","location":{"crs":{"type":"name","properties":{"name":"EPSG:4326"}},"type":"Point","coordinates":[76.53645158861788,14.387097877362908]},"sensors_triggered":["camera"],"zone_id":"19","alarm_priority":null,"id":3884,"record_flag":"1","object_identified":"person","pole_number":15}]

          //  let val = _.mapValues(_.groupBy(res, 'zone_id'),
          //  clist => clist.map(car => _.omit(car, 'zone_id')));

          console.log('ressssss val', arr);
          this.postAnalysisData = arr;
          //  this.getImage('event_1123452345_2021-12-16T11:09')
          // this.getImage('kkl')
        }
      });

      /* this.postAnalysisService.getImagesSourceApi('filter', formattedData).subscribe((res) => {
        var result = [];
        if (res && res.length > 0) {
          res.forEach(function (hash) {
            return function (a) {
              if (a.zone_id) {
                if (!hash[a.zone_id]) {
                  hash[a.zone_id] = { zone_id: a.zone_id, zone_name: 'Zone : ' + a.zone_id, alarms: [] };
                  result.push(hash[a.zone_id]);
                }
                hash[a.zone_id].alarms.push(a);
              }
              else if (!a.zone_id) {
                if (!hash["others"]) {
                  hash["others"] = { zone_id: null, zone_name: "Others", alarms: [] };
                  result.push(hash["others"]);
                }
                hash["others"].alarms.push(a);
              }
            };
          }(Object.create(null)));
        }
        this.postAnalysisData = result;
        console.log('postAnalysisData', this.postAnalysisData)
        this.isLoading = false;
      }, (err) => {
        this.isLoading = false;
      }); */

      this.isLoading = false;
      //this.postAnalysisData = [{ zone_name: "zone-19", alarms: [{ alarm_id: "0trn-22ZRywt7LSEQKORi", videos: ["0trn-22ZRywt7LSEQKORi_raw.mp4", "0trn-22ZRywt7LSEQKORi.mp4"], images: ["0trn-22ZRywt7LSEQKORi_1.png", "0trn-22ZRywt7LSEQKORi_2.png"] }] }];
      // this.postAnalysisData = [{ zone_name: "zone-19", alarms: [{ alarm_id: "0trn-22ZRywt7LSEQKORi", videos: ["0trn-22ZRywt7LSEQKORi.mp4"], images: ["image1.png"] }] }];

    }
  }

  // Allow video in full screen mode
  enableFullscreen(alarmData, index): void {
    const elem: any = document.getElementById('slides-' + alarmData.alarm_id + '-' + index);
    this.commonService.enableFullScreen(elem);
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }

  getFrameId(imgStr, alarmData) {
    if (imgStr && alarmData && alarmData.length) {
      let frameIdStr = imgStr.substring(imgStr.lastIndexOf("_") + 1).split(".")[0];
      let alarmRecIdx = alarmData.findIndex(rec => rec.frameid == Number(frameIdStr))
      let frameId = alarmRecIdx !== -1 ? alarmData[alarmRecIdx].frameid : frameIdStr;
      return frameId;
    }
  }

  getVideoType(pathStr, alarm_id) {
    if (pathStr && alarm_id) {
      let isRaw = pathStr.substring(pathStr.lastIndexOf("/") + 1).toLowerCase().includes("raw");
      if (isRaw) {
        return `Raw Clip - ${alarm_id.substring(0, 30) + "..."} `
      } else {
        return `Detected Clip - ${alarm_id.substring(0, 30) + "..."}`
      }
    }
  }

  async getImage(img) {
    await this.commonService.getImage(img).subscribe((res) => {
      // if (!res.error) {
      console.log('res -----------', res);
      // }
      return res;
    });
    return;
  }

  tabClick(event) {
    console.log('clicked', event, this.postAnalysisData)
    let idx = event.index;
    if (idx !== -1) {
      let imgpath = this.postAnalysisData[0]['alarms'][idx].images[0];
      console.log('imgpath', imgpath, imgpath.split(','));
      let len = imgpath.split(',');
      if(len.length == 1){
        this.commonService.getImage(imgpath).subscribe((res: any) => {
          if (res) {
              this.postAnalysisData[0]['alarms'][idx].images = [`data:image/png;base64,${res.image_base64}`];
              console.log('res -----------', res);
          }
        });
       }
    }

  }

  getVideo(video){
    let url = `http://${server_info.SERVER_IP}:3058/api/image/getVideo?id=${video}`;
    return url;
  }
}
