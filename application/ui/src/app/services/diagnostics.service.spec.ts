import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DiagnosticsService } from './diagnostics.service';

describe('DiagnosticService', () => {
  let service: DiagnosticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      providers: [DiagnosticsService]
    });
    service = TestBed.inject(DiagnosticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
