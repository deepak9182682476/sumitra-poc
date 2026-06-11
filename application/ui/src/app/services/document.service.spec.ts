import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      providers: [DocumentService]
    });
    service = TestBed.inject(DocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should setcss', () => {
    let data = {
      html : 'html',
      fontsize : 'font-size', 
      medium : "0.125rem",
      val : '0.9rem'
    }
    let setCssRes = service.setCss(data.html, data.fontsize, data.medium, data.val);

    expect(setCssRes).toBeUndefined();
  })
});
