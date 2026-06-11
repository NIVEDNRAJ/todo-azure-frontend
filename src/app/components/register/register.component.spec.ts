import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: any;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = { register: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form fields matching criteria', () => {
    expect(component.registerForm.valid).toBe(false);

    const nameControl = component.registerForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);

    nameControl?.setValue('A'.repeat(101));
    expect(nameControl?.hasError('maxlength')).toBe(true);

    nameControl?.setValue('Valid Name');
    expect(nameControl?.valid).toBe(true);
  });

  it('should validate passwords match', () => {
    const form = component.registerForm;
    const password = form.get('password');
    const confirm = form.get('confirmPassword');

    password?.setValue('password123');
    confirm?.setValue('different123');
    fixture.detectChanges();
    expect(form.hasError('passwordMismatch')).toBe(true);

    confirm?.setValue('password123');
    fixture.detectChanges();
    expect(form.hasError('passwordMismatch')).toBe(false);
  });

  it('should not call register service if form is invalid', () => {
    component.onSubmit();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should call register service and redirect to dashboard on success', () => {
    authServiceSpy.register.mockReturnValue(of({ token: 'reg-token' }));

    component.registerForm.setValue({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123'
    });
    expect(component.isLoading()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should display error message on registration failure', () => {
    const mockError = { error: { message: 'Email already exists.' } };
    authServiceSpy.register.mockReturnValue(throwError(() => mockError));

    component.registerForm.setValue({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Email already exists.');
  });
});
