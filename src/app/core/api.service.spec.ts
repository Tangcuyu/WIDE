import { TestBed } from '@angular/core/testing';

import { ApiProvider } from './api.service';

describe('ApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApiProvider = TestBed.get(ApiProvider);
    expect(service).toBeTruthy();
  });
});
