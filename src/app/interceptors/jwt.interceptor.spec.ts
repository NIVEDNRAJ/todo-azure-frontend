import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';

describe('jwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: any;

  beforeEach(() => {
    authServiceSpy = { getToken: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header if token is present', () => {
    authServiceSpy.getToken.mockReturnValue('my-secret-token');

    httpClient.get('/api/todo').subscribe();

    const req = httpMock.expectOne('/api/todo');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-secret-token');
    req.flush({});
  });

  it('should not add Authorization header if token is not present', () => {
    authServiceSpy.getToken.mockReturnValue(null);

    httpClient.get('/api/todo').subscribe();

    const req = httpMock.expectOne('/api/todo');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
