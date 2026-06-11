import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoDialogComponent } from './todo-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Todo } from '../../models/todo.model';

describe('TodoDialogComponent', () => {
  let component: TodoDialogComponent;
  let fixture: ComponentFixture<TodoDialogComponent>;
  let dialogRefSpy: any;

  const configureTestBed = (data: { todo?: Todo }) => {
    dialogRefSpy = { close: vi.fn() };

    return TestBed.configureTestingModule({
      imports: [TodoDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data }
      ]
    }).compileComponents();
  };

  describe('Create Mode (no todo provided)', () => {
    beforeEach(async () => {
      await configureTestBed({});
      fixture = TestBed.createComponent(TodoDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize in create mode', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode()).toBe(false);
      expect(component.todoForm.value).toEqual({ title: '', description: '' });
    });

    it('should validate title is required', () => {
      const title = component.todoForm.get('title');
      title?.setValue('');
      expect(title?.hasError('required')).toBe(true);
    });

    it('should close dialog with form values on valid submit', () => {
      component.todoForm.setValue({
        title: 'New Todo Title',
        description: 'New Desc'
      });

      component.onSubmit();

      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        title: 'New Todo Title',
        description: 'New Desc'
      });
    });

    it('should not close dialog on submit if form is invalid', () => {
      component.onSubmit();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should close dialog with no value on cancel', () => {
      component.onCancel();
      expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });
  });

  describe('Edit Mode (existing todo provided)', () => {
    const mockTodo: Todo = {
      id: 99,
      title: 'Existing Title',
      description: 'Existing Desc',
      isCompleted: false,
      userId: 1,
      createdAt: '',
      updatedAt: ''
    };


    beforeEach(async () => {
      await configureTestBed({ todo: mockTodo });
      fixture = TestBed.createComponent(TodoDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize in edit mode with todo details', () => {
      expect(component.isEditMode()).toBe(true);
      expect(component.todoForm.value).toEqual({
        title: 'Existing Title',
        description: 'Existing Desc'
      });
    });
  });
});
