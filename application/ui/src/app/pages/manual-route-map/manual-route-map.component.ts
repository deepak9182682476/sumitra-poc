import { Component, ElementRef, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-manual-route-map',
  templateUrl: './manual-route-map.component.html',
  styleUrls: ['./manual-route-map.component.scss']
})

export class ManualRouteMapComponent implements AfterViewInit {
  @ViewChild('smrMapId') smrMapId: ElementRef;
  @Output() smrMapIdOutput: EventEmitter<ElementRef> = new EventEmitter<ElementRef>();

  ngAfterViewInit() {
    this.smrMapIdOutput.emit(this.smrMapId);
  }
}