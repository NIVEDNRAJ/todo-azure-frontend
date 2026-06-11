import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { TodoService } from '../../services/todo.service';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Todo } from '../../models/todo.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authServiceSpy: any;
  let todoServiceSpy: any;
  let dialogSpy: any;

  const mockTodos: Todo[] = [
    { id: 1, title: 'Task 1', description: 'Desc 1', isCompleted: false, userId: 1, createdAt: '', updatedAt: '' },
    { id: 2, title: 'Task 2', description: 'Desc 2', isCompleted: true, userId: 1, createdAt: '', updatedAt: '' }
  ];

  beforeEach(async () => {
    authServiceSpy = {
      currentUser: vi.fn().mockReturnValue({ name: 'Alice Test' }),
      logout: vi.fn()
    };

    todoServiceSpy = {
      getPaged: vi.fn().mockReturnValue(of({
        items: mockTodos,
        totalCount: 2
      })),
      create: vi.fn().mockReturnValue(of(mockTodos[0])),
      update: vi.fn().mockReturnValue(of(mockTodos[1])),
      delete: vi.fn().mockReturnValue(of(null))
    };

    dialogSpy = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TodoService, useValue: todoServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });

    TestBed.overrideComponent(DashboardComponent, {
      set: {
        providers: [
          { provide: AuthService, useValue: authServiceSpy },
          { provide: TodoService, useValue: todoServiceSpy },
          { provide: MatDialog, useValue: dialogSpy }
        ]
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create the component and load todos', () => {
    expect(component).toBeTruthy();
    expect(authServiceSpy.currentUser).toHaveBeenCalled();
    expect(component.userName()).toBe('Alice Test');
    expect(todoServiceSpy.getPaged).toHaveBeenCalledWith('', undefined, 1, 6);
    expect(component.todos()).toEqual(mockTodos);
    expect(component.totalCount()).toBe(2);
  });

  it('should update search filter and reload on search', () => {
    const inputEvent = { target: { value: 'clean' } } as unknown as Event;
    component.onSearch(inputEvent);

    expect(component.searchText()).toBe('clean');
    expect(component.pageNumber()).toBe(1);
    expect(todoServiceSpy.getPaged).toHaveBeenLastCalledWith('clean', undefined, 1, 6);
  });

  it('should update completed filter and reload on setFilter', () => {
    component.setFilter(true);
    expect(component.completedFilter()).toBe(true);
    expect(component.pageNumber()).toBe(1);
    expect(todoServiceSpy.getPaged).toHaveBeenLastCalledWith('', true, 1, 6);
  });

  it('should navigate between pages', () => {
    // Setup page counts
    component.totalCount.set(15); // with pageSize 6, totalPages = 3
    expect(component.totalPages()).toBe(3);

    // Test nextPage
    component.nextPage();
    expect(component.pageNumber()).toBe(2);
    expect(todoServiceSpy.getPaged).toHaveBeenLastCalledWith('', undefined, 2, 6);

    // Test prevPage
    component.prevPage();
    expect(component.pageNumber()).toBe(1);
    expect(todoServiceSpy.getPaged).toHaveBeenLastCalledWith('', undefined, 1, 6);
  });

  it('should open add dialog and create todo on dialog close submit', () => {
    const dialogRefMock = {
      afterClosed: vi.fn().mockReturnValue(of({ title: 'New task', description: 'desc' }))
    };
    dialogSpy.open.mockReturnValue(dialogRefMock);

    component.openAddDialog();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(todoServiceSpy.create).toHaveBeenCalledWith({ title: 'New task', description: 'desc' });
  });

  it('should open edit dialog and update todo on dialog close submit', () => {
    const targetTodo = mockTodos[0];
    const dialogRefMock = {
      afterClosed: vi.fn().mockReturnValue(of({ title: 'Updated task', description: 'updated desc' }))
    };
    dialogSpy.open.mockReturnValue(dialogRefMock);

    component.openEditDialog(targetTodo);

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(todoServiceSpy.update).toHaveBeenCalledWith(targetTodo.id, {
      title: 'Updated task',
      description: 'updated desc',
      isCompleted: targetTodo.isCompleted
    });
  });

  it('should toggle completed state and call update service', () => {
    const targetTodo = mockTodos[0]; // isCompleted: false
    component.toggleComplete(targetTodo);

    // Check optimistic UI update
    const updatedTodo = component.todos().find(t => t.id === targetTodo.id);
    expect(updatedTodo?.isCompleted).toBe(true);

    expect(todoServiceSpy.update).toHaveBeenCalledWith(targetTodo.id, {
      title: targetTodo.title,
      description: targetTodo.description,
      isCompleted: true
    });
  });

  it('should prompt delete and call delete service on confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteTodo(1);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    expect(todoServiceSpy.delete).toHaveBeenCalledWith(1);
  });

  it('should not call delete service if user cancels prompt', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteTodo(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(todoServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('should call auth service logout on logout click', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
