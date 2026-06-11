import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { VideoComponent } from './video.component';
import { PostAnalysisService } from 'src/app/services/post-analysis.service';
import { of } from 'rxjs';

describe('VideoComponent', () => {
  let component: VideoComponent;
  let fixture: ComponentFixture<VideoComponent>;
  let postAnalysisService: PostAnalysisService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [VideoComponent],
      providers: [PostAnalysisService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoComponent);
    postAnalysisService = TestBed.inject(PostAnalysisService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call enableFullscreen ', fakeAsync(() => {
    fixture = TestBed.createComponent(VideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var mockALarmData = {
      alarm_id: 1
    }
    spyOn(component, 'enableFullscreen').and.callThrough();
    // component.enableFullscreen(mockALarmData, 1);

    // expect(component.enableFullscreen).toHaveBeenCalled();
    expect(component.enableFullscreen).toThrowMatching(err => err);
    flush();
  }));

  it('should be defined postAnalysisFilterData', () => {
    spyOn(postAnalysisService, 'getImagesSourceApi').and.returnValue(of([
      {
        zone_id: 1
      }
    ]));
    component.postAnalysisFilterData(
      JSON.stringify({ zoneId: 'All', alarmId: 'All' })
    );
  });

});
