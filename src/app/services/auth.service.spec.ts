import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: any;

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };
    
    // Clear localStorage
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should register a user and save credentials', () => {
    const mockResponse: AuthResponse = {
      token: 'jwt-token-123',
      userId: 1,
      name: 'John',
      email: 'john@example.com'
    };

    service.register({ name: 'John', email: 'john@example.com', password: 'password123' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.currentUser()).toEqual(mockResponse);
      expect(service.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('todo_token')).toBe('jwt-token-123');
    });

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should login a user and save credentials', () => {
    const mockResponse: AuthResponse = {
      token: 'jwt-token-123',
      userId: 1,
      name: 'John',
      email: 'john@example.com'
    };

    service.login({ email: 'john@example.com', password: 'password123' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.currentUser()).toEqual(mockResponse);
      expect(service.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('todo_token')).toBe('jwt-token-123');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout a user, clear localStorage and redirect to login', () => {
    localStorage.setItem('todo_token', 'token');
    localStorage.setItem('todo_user', JSON.stringify({ name: 'John' }));
    
    // Reset service state
    service.currentUser.set({ token: 'token', userId: 1, name: 'John', email: 'john@example.com' });

    service.logout();

    expect(localStorage.getItem('todo_token')).toBeNull();
    expect(localStorage.getItem('todo_user')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return token from storage via getToken()', () => {
    localStorage.setItem('todo_token', 'my-stored-token');
    expect(service.getToken()).toBe('my-stored-token');
  });
});
