import { TestBed } from '@angular/core/testing';

import { MassageServiceService } from './massage-services.service';

describe('MassageServicesService', () => {
  let service: MassageServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MassageServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
