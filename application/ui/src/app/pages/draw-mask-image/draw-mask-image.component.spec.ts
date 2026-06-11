import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { DrawMaskImageComponent } from './draw-mask-image.component';

describe('DrawMaskImageComponent', () => {
  let component: DrawMaskImageComponent;
  let fixture: ComponentFixture<DrawMaskImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DrawMaskImageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call draw', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'draw').and.callThrough();
    component.draw();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.draw).toHaveBeenCalled();
    expect(component.draw).toBeDefined();
  }));

  it('should call saveCanvasAsImage', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'saveCanvasAsImage').and.callThrough();
    component.saveCanvasAsImage();
    fixture.detectChanges();

    expect(component.saveCanvasAsImage).toHaveBeenCalled();
    expect(component.saveCanvasAsImage).toBeDefined();
  }));

  it('should call getSensorCoordinates', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getSensorCoordinates').and.callThrough();
    component.getSensorCoordinates();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getSensorCoordinates).toHaveBeenCalled();
    expect(component.getSensorCoordinates).toBeDefined();
  }));

  it('should call setCameraImage', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'setCameraImage').and.callThrough();
    let evt = {
      target: {
        value: 'img'
      }
    }
    component.setCameraImage(evt);
    fixture.detectChanges();

    expect(component.setCameraImage).toHaveBeenCalled();
    expect(component.setCameraImage).toBeDefined();
  }));

  it('should call mmEv', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'mmEvent').and.callThrough();

    let evt = {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 0,
      cancelBubble: false,
      cancelable: true,
      clientX: 541,
      clientY: 533,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 0,
      eventPhase: 0,
      fromElement: null,
      isTrusted: true,
      layerX: 497,
      layerY: 413,
      metaKey: false,
      movementX: 23,
      movementY: 28,
      offsetX: 498,
      offsetY: 414,
      pageX: 541,
      pageY: 533,
      relatedTarget: null,
      returnValue: true,
      screenX: 541,
      screenY: 636,
      shiftKey: false,
      srcElement: 'canvas',
      target: 'canvas',
      timeStamp: 9689.905000035651,
      toElement: 'canvas',
      type: "mousemove",
      which: 0,
      x: 541,
      y: 533
    }
    component.isDrawing = true;
    fixture.detectChanges();

    component.mmEvent(evt);
    fixture.detectChanges();

    expect(component.mmEvent).toHaveBeenCalled();
    expect(component.mmEvent).toBeDefined();
  }));

  it('should call muEvent', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'muEvent').and.callThrough();

    let evt = {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 0,
      cancelBubble: false,
      cancelable: true,
      clientX: 273,
      clientY: 230,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 1,
      eventPhase: 0,
      fromElement: null,
      isTrusted: true,
      layerX: 229,
      layerY: 110,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      offsetX: 230,
      offsetY: 111,
      pageX: 273,
      pageY: 230,
      relatedTarget: null,
      returnValue: true,
      screenX: 273,
      screenY: 333,
      shiftKey: false,
      srcElement: 'canvas',
      target: 'canvas',
      timeStamp: 9031.105000001844,
      toElement: 'canvas',
      type: "mouseup ",
      which: 1,
      x: 273,
      y: 230
    }
    component.isDrawing = true;
    fixture.detectChanges();

    component.muEvent(evt);
    fixture.detectChanges();

    expect(component.muEvent).toHaveBeenCalled();
    expect(component.muEvent).toBeDefined();
  }));

  it('should call mdEvent', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'mdEvent').and.callThrough();

    let evt = {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelBubble: false,
      cancelable: true,
      clientX: 264,
      clientY: 194,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 1,
      eventPhase: 0,
      fromElement: null,
      isTrusted: true,
      layerX: 220,
      layerY: 74,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      offsetX: 221,
      offsetY: 75,
      pageX: 264,
      pageY: 194,
      relatedTarget: null,
      returnValue: true,
      screenX: 264,
      screenY: 297,
      shiftKey: false,
      srcElement: 'canvas',
      target: 'canvas',
      timeStamp: 6887.274999986403,
      toElement: 'canvas',
      type: "mousedown",
      which: 1,
      x: 264,
      y: 194
    }

    component.mdEvent(evt);
    fixture.detectChanges();

    expect(component.mdEvent).toHaveBeenCalled();
    expect(component.mdEvent).toBeDefined();
  }));

  it('should call getMousePosition', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getMousePosition').and.callThrough();

    let evt = {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelBubble: false,
      cancelable: true,
      clientX: 278,
      clientY: 291,
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 0,
      eventPhase: 0,
      fromElement: null,
      isTrusted: true,
      layerX: 234,
      layerY: 171,
      metaKey: false,
      movementX: 1,
      movementY: 0,
      offsetX: 235,
      offsetY: 172,
      pageX: 278,
      pageY: 291,
      relatedTarget: null,
      returnValue: true,
      screenX: 278,
      screenY: 394,
      shiftKey: false,
      srcElement: 'canvas',
      target: 'canvas',
      timeStamp: 7358.20999997668,
      toElement: 'canvas',
      type: "mousemove",
      which: 1,
      x: 278,
      y: 291
    }

    component.getMousePosition(evt);
    fixture.detectChanges();

    expect(component.getMousePosition).toHaveBeenCalled();
    expect(component.getMousePosition).toBeDefined();
  }));

  it('should call drawRect', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'drawRect').and.callThrough();

    component.drawRect(212.8125, 42.875, 98, 53);
    fixture.detectChanges();

    expect(component.drawRect).toHaveBeenCalled();
    expect(component.drawRect).toBeDefined();
  }));

  it('should call drawCircle', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'drawCircle').and.callThrough();

    component.drawCircle(164.8125, 73.875, 248.8125, 180.875, 84, 107);
    fixture.detectChanges();

    expect(component.drawCircle).toHaveBeenCalled();
    expect(component.drawCircle).toBeDefined();
  }));

  it('should call decodeBase64Image', fakeAsync(() => {
    fixture = TestBed.createComponent(DrawMaskImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'decodeBase64Image').and.callThrough();
    var dataUri = "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAABMLAAATCwAAAAAAAAAAAABsiqb/bIqm/2yKpv9siqb/bIqm/2yKpv9siqb/iKC3/2yKpv9siqb/bIqm/2yKpv9siqb/bIqm/2yKpv9siqb/bIqm/2yKpv9siqb/bIqm/2yKpv9siqb/2uLp///////R2uP/dZGs/2yKpv9siqb/bIqm/2yKpv9siqb/bIqm/2yKpv9siqb/bIqm/2yKpv9siqb/bIqm/////////////////+3w9P+IoLf/bIqm/2yKpv9siqb/bIqm/2yKpv9siqb/bIqm/2yKpv9siqb/bIqm/2yKpv///////////+3w9P+tvc3/dZGs/2yKpv9siqb/bIqm/2yKpv9siqb/TZbB/02Wwf9NlsH/TZbB/02Wwf9NlsH////////////0+Pv/erDR/02Wwf9NlsH/TZbB/02Wwf9NlsH/TZbB/02Wwf9NlsH/TZbB/02Wwf9NlsH/TZbB//////////////////////96sNH/TZbB/02Wwf9NlsH/TZbB/02Wwf9NlsH/TZbB/02Wwf9NlsH/TZbB/02Wwf////////////////+Ft9T/TZbB/02Wwf9NlsH/TZbB/02Wwf9NlsH/E4zV/xOM1f8TjNX/E4zV/yKT2P/T6ff/////////////////4fH6/z+i3f8TjNX/E4zV/xOM1f8TjNX/E4zV/xOM1f8TjNX/E4zV/xOM1f+m1O/////////////////////////////w+Pz/IpPY/xOM1f8TjNX/E4zV/xOM1f8TjNX/E4zV/xOM1f8TjNX////////////T6ff/Tqng/6bU7////////////3u/5/8TjNX/E4zV/xOM1f8TjNX/AIv//wCL//8Ai///AIv/////////////gMX//wCL//8gmv////////////+Axf//AIv//wCL//8Ai///AIv//wCL//8Ai///AIv//wCL///v+P///////+/4//+Axf//z+n/////////////YLf//wCL//8Ai///AIv//wCL//8Ai///AIv//wCL//8Ai///gMX/////////////////////////////z+n//wCL//8Ai///AIv//wCL//8Ai///AHr//wB6//8Aev//AHr//wB6//+Avf//7/f/////////////v97//xCC//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AHr//wB6//8Aev//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

    component.decodeBase64Image(dataUri);
    fixture.detectChanges();

    expect(component.decodeBase64Image).toHaveBeenCalled();
    expect(component.decodeBase64Image).toBeDefined();
  }));

});
