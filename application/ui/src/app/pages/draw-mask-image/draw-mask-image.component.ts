import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-draw-mask-image',
  templateUrl: './draw-mask-image.component.html',
  styleUrls: ['./draw-mask-image.component.scss']
})

export class DrawMaskImageComponent implements OnInit, AfterViewInit {

  // Variables
  canvasWidth;
  canvasHeight;
  coordinates = [];
  isDrawing = false;
  mouseStartX = 0.0;
  mouseStartY = 0.0;
  mouseEndX = 0.0;
  mouseEndY = 0.0;
  width = 0.0;
  height = 0.0;

  @ViewChild("canvas") canvasElement: ElementRef;
  canvas = null;
  ctx = null;
  shapeType = "";
  showCanvasArea = false;
  shapes;
  imageObj = null;
  sensorType = "";
  sensors_list = [];
  isImageNeeded = true;

  constructor(private dataService: DataService) {
    this.shapes = function shapeType(shape, sx, sy, ex, ey) {
      this.type = shape;
      this.sx = sx;
      this.sy = sy;
      this.ex = ex;
      this.ey = ey;
    }
  }

  draw() {
    this.ctx.restore();
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    // if (this.isImageNeeded && this.imageObj)
      // this.ctx.drawImage(this.imageObj, 0, 0);

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.coordinates.filter(shape => {
      var sx = shape.sx;
      var sy = shape.sy;
      var ex = shape.ex;
      var ey = shape.ey;
      var w = ex - sx;
      var h = ey - sy;
      if (shape.type === "rectangle") {
        this.drawRect(sx, sy, w, h);
      }
      else if (shape.type === "circle") {
        this.drawCircle(sx, sy, ex, ey, w, h);
      }
    });
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fillStyle = "black";
    this.ctx.fill();
  }

  getMousePosition(e) {
    if (this.canvas && e) {
      var bounds = this.canvas.getBoundingClientRect();
      return [
        e.clientX - bounds.left,
        e.clientY - bounds.top
      ];
    } else {
      return [
        0.0,
        0.0
      ];
    }
  }

  // Event Handlers
  mdEvent(e) {
    if (!this.isDrawing) {
      this.isDrawing = true;
      [this.mouseStartX, this.mouseStartY] = this.getMousePosition(e);
      this.canvas.style.cursor = "crosshair";
    }
  }

  muEvent(e) {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.coordinates.push(
        new this.shapes(this.shapeType, this.mouseStartX, this.mouseStartY, this.mouseEndX, this.mouseEndY)
      );
      this.draw();
      this.canvas.style.cursor = "default";
    }
  }

  mmEvent(e) {
    if (this.isDrawing) {
      [this.mouseEndX, this.mouseEndY] = this.getMousePosition(e);
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight); //clear canvas
      this.draw();
      this.ctx.beginPath();
      this.width = this.mouseEndX - this.mouseStartX;
      this.height = this.mouseEndY - this.mouseStartY;
      if (this.shapeType === "rectangle") {
        this.drawRect(this.mouseStartX, this.mouseStartY, this.width, this.height);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
      } else if (this.shapeType === "circle") {
        this.drawCircle(this.mouseStartX, this.mouseStartY, this.mouseEndX, this.mouseEndY, this.width, this.height);
      }
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  drawRect(sx, sy, w, h): void {
    this.ctx.rect(sx, sy, w, h);
  }

  drawCircle(sx, sy, ex, ey, w, h): void {
    this.ctx.moveTo(sx, sy + (h) / 2);
    this.ctx.bezierCurveTo(sx, sy, ex, sy, ex, sy + (h) / 2);
    this.ctx.bezierCurveTo(ex, ey, sx, ey, sx, sy + (h) / 2);
  }

  showImage() {
    this.showCanvasArea = true;
    this.canvas = this.canvasElement.nativeElement;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.ctx = this.canvasElement.nativeElement.getContext("2d");

    this.setCameraImage();
  }

  saveCanvasAsImage(): void {
    this.isImageNeeded = false;
    // this.ctx.clearRect(0,0,this.canvasWidth, this.canvasHeight);
    // this.draw();
    var image = this.canvas.toDataURL("image/png");
    console.log("---image---", image);

    var data = {
      'image' : this.decodeBase64Image(image),
      'ip' : '10.66.40.62'
    }   

    var a = document.createElement('a');
    a.href = image;
    a.download = "mask-image.png";
    document.body.appendChild(a);
    a.click();
    console.log(data); 

    this.dataService.saveMaskedImage(data).subscribe(result => {
      console.log(result);
    }, (err) => {
      console.log(err);
    });
  }

 decodeBase64Image(dataURI) {
  var BASE64_MARKER = ';base64,';

    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));
    for(let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  ngOnInit(): void {
    this.getSensorCoordinates();
  }

  getSensorCoordinates() {
    this.dataService.getSensorCoordinates().subscribe((result: any) => {
      this.sensors_list = result.features.filter(item => item.properties.sensor_type === 'EOIR' || item.properties.sensor_type === 'TI').map(item => { return item.properties });
    }, (err) => {
      console.log(err);
    });
  }

  setCameraImage() {
    let camera_ip = this.sensorType;
    console.log("---camera_ip---", camera_ip);
    
    this.imageObj = new Image();
    let self = this;
    this.imageObj.src = `http://195.67.15.3:5000/video?ip=${camera_ip}`;
    this.imageObj.crossOrigin = "*";
    this.draw();
  }

  ngAfterViewInit(): void {
    /* this.canvas = this.canvasElement.nativeElement;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.ctx = this.canvasElement.nativeElement.getContext("2d"); */
  }

}