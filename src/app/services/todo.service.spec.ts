import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TodoService } from './todo.service';
import { PagedResult, Todo } from '../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoService]
    });

    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get paged todos with default query parameters', () => {
    const mockResult: PagedResult<Todo> = {
      items: [{ id: 1, title: 'Task 1', description: 'Desc 1', isCompleted: false, userId: 1, createdAt: '', updatedAt: '' }],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    service.getPaged().subscribe(result => {
      expect(result).toEqual(mockResult);
    });

    const req = httpMock.expectOne(request => 
      request.url === '/api/todo' &&
      request.params.get('pageNumber') === '1' &&
      request.params.get('pageSize') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResult);
  });

  it('should get paged todos with search and completed filter', () => {
    const mockResult: PagedResult<Todo> = {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10
    };

    service.getPaged('clean', true, 2, 5).subscribe(result => {
      expect(result).toEqual(mockResult);
    });

    const req = httpMock.expectOne(request => 
      request.url === '/api/todo' &&
      request.params.get('pageNumber') === '2' &&
      request.params.get('pageSize') === '5' &&
      request.params.get('search') === 'clean' &&
      request.params.get('isCompleted') === 'true'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResult);
  });

  it('should get todo by ID', () => {
    const mockTodo: Todo = { id: 5, title: 'Task 5', description: '', isCompleted: false, userId: 1, createdAt: '', updatedAt: '' };

    service.getById(5).subscribe(todo => {
      expect(todo).toEqual(mockTodo);
    });

    const req = httpMock.expectOne('/api/todo/5');
    expect(req.request.method).toBe('GET');
    req.flush(mockTodo);
  });

  it('should create todo', () => {
    const mockTodo: Todo = { id: 10, title: 'New task', description: 'desc', isCompleted: false, userId: 1, createdAt: '', updatedAt: '' };

    service.create({ title: 'New task', description: 'desc' }).subscribe(todo => {
      expect(todo).toEqual(mockTodo);
    });

    const req = httpMock.expectOne('/api/todo');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'New task', description: 'desc' });
    req.flush(mockTodo);
  });

  it('should update todo', () => {
    const mockTodo: Todo = { id: 10, title: 'Updated task', description: 'desc', isCompleted: true, userId: 1, createdAt: '', updatedAt: '' };

    service.update(10, { title: 'Updated task', description: 'desc', isCompleted: true }).subscribe(todo => {
      expect(todo).toEqual(mockTodo);
    });

    const req = httpMock.expectOne('/api/todo/10');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Updated task', description: 'desc', isCompleted: true });
    req.flush(mockTodo);
  });

  it('should delete todo', () => {
    service.delete(10).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('/api/todo/10');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
