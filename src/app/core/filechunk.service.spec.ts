import { TestBed } from '@angular/core/testing';

import { FilechunkService } from './filechunk.service';

describe('FilechunkService', () => {
  let service: FilechunkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilechunkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
