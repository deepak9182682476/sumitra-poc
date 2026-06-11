import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { GraphComponent } from './graph/graph.component';
import { PostAnalysisService } from '../../services/post-analysis.service';
import { CommonService } from 'src/app/services/common.service';
import { FormControl, Validators } from '@angular/forms';
import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-post-analysis',
  templateUrl: './post-analysis.component.html',
  styleUrls: ['./post-analysis.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PostAnalysisComponent implements OnInit {
  itemsPerSlide = 5;
  singleSlideOffset = true;
  noWrap = true;
  @ViewChild(GraphComponent) graphComponent: GraphComponent;
  filters = {
    graph: {
      zoneID: null,
      time: null,
      alarmID: null,
    },
  };
  activeTab = 'graph';
  activeTabTitle = '';
  enablePDF = false;
  months = [
    { key: 1, name: 'JAN' },
    { key: 2, name: 'FEB' },
    { key: 3, name: 'MAR' },
    { key: 4, name: 'APR' },
    { key: 5, name: 'MAY' },
    { key: 6, name: 'JUNE' },
    { key: 7, name: 'JULY' },
    { key: 8, name: 'AUG' },
    { key: 9, name: 'SEPT' },
    { key: 10, name: 'OCT' },
    { key: 11, name: 'NOV' },
    { key: 12, name: 'DEC' }
  ];
  daysCountForMonth: number = 0;
  selectedMonth: any;
  date = new FormControl(moment(), Validators.required);
  
  constructor(private postAnalysisService: PostAnalysisService,
    public commonService: CommonService) { }

  ngOnInit(): void {
    this.activeTabTitle = this.getTranslationLang('graph');
    // Added 1 as new Date().getMonth() starts from 0
    this.getGraphData(new Date().getFullYear(), new Date().getMonth() + 1);
  }

  /** Download Chart */
  downloadGraph(): void {
    this.graphComponent.downloadAsPdf();
  }

  enableDisablePDF(event): void {
    this.enablePDF = false;
    if (event.length) {
      this.enablePDF = true;
    }
  }

  /** Display Map/Graph Section */
  activateMapGraph(tabName): void {
    this.activeTab = tabName ? 'map' : 'graph';
    this.activeTabTitle = tabName ? this.getTranslationLang('map') :
      this.getTranslationLang('graph');
    this.graphComponent.getActiveTab(this.activeTab);
  }

  filterGraphs(): void {
    this.graphComponent.graphTimeFilter(this.filters.graph.time);
  }

  /**
   * Returns days count in month
   * Passing current year for time being new Date().getFullYear()
   * @param monthVal 
   */
   getGraphData(yearVal, monthVal) {
    this.daysCountForMonth = new Date(yearVal, monthVal, 0).getDate();
    if (this.graphComponent) {
      this.graphComponent.formChartData(yearVal, monthVal, this.daysCountForMonth);
    }
  }

  chosenYearHandler(normalizedYear) {
    const ctrlValue = this.date.value;
    let nyear = moment(normalizedYear);

    ctrlValue.year(nyear.year());
    this.date.setValue(ctrlValue);
    // this.getGraphData(ctrlValue.year(), ctrlValue.month());
  }

  chosenMonthHandler(normalizedMonth, datepicker) {
    const ctrlValue = this.date.value;
    let nmonth = moment(normalizedMonth);
    ctrlValue.month(nmonth.month());
    this.date.setValue(ctrlValue);
    this.getGraphData(ctrlValue.year(), ctrlValue.month());
  
    datepicker.close();
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }
}
