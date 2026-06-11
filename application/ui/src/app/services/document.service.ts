import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class DocumentService {

  constructor(@Inject(DOCUMENT) private document) { }

  setCss(element, attribute, value, defaultSize) {
    this.document.querySelector(element).style[attribute] = defaultSize;
    this.document.documentElement.style.setProperty('--custom-font-size', value);
  }

}