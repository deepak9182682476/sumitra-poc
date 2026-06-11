import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PostAnalysisService } from './post-analysis.service';

describe('PostAnalysisService', () => {
  let service: PostAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      providers: [PostAnalysisService]
    });
    service = TestBed.inject(PostAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
