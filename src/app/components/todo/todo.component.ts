import { Component, computed, effect, signal } from '@angular/core';
import { FilterType, TodoModel } from '../../models/todo';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Buttons } from '../../../libs/constants';

@Component({
  selector: 'app-todo',
  standalone: true,
  // ? ReactiveFormsModule -> handle forms
  imports: [ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css',
})
export class TodoComponent {
  todoList = signal<TodoModel[]>([]);
  Buttons = Buttons;
  // ? signal
  filter = signal<FilterType>('all');
  // ? computed signal -> depends on another signal
  todoListFiltered = computed(() => {
    const filter = this.filter();
    const todos = this.todoList();

    switch (filter) {
      case 'active':
        return todos.filter((item) => !item.completed);
      case 'completed':
        return todos.filter((item) => item.completed);
      default:
        return todos;
    }
  });

  // to control form
  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });

  // constructor
  constructor() {
    // runs on class creation
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todoList()));
    });
  }
  // start when the class is initialized -> like useEffect, []
  ngOnInit() {
    const todosStorage = localStorage.getItem('todos');

    if (todosStorage !== null) {
      this.todoList.set(JSON.parse(todosStorage));
    }
  }

  changeFilter(value: FilterType) {
    this.filter.set(value);
  }

  addTodo(event: Event) {
    event.preventDefault();

    const newTodoTitle = this.newTodo.value.trim();
    if (this.newTodo.valid && newTodoTitle !== '') {
      this.todoList.update((prevTodos) => [
        ...prevTodos,
        {
          id: Date.now(),
          title: newTodoTitle,
          completed: false,
          editing: false,
        },
      ]);

      this.newTodo.reset();
    } else {
      window.alert('Invalid task title');
    }
  }

  toggleTodo(todoId: number) {
    return this.todoList.update((prev) =>
      prev.map((item) =>
        item.id === todoId ? { ...item, completed: !item.completed } : item
      )
    );
  }

  removeTodo(todoId: number) {
    this.todoList.update((prev) => prev.filter((item) => item.id !== todoId));
  }

  updateTodoEditMode(todoId: number) {
    return this.todoList.update((prev) =>
      prev.map((item) =>
        item.id === todoId ? { ...item, editing: true } : item
      )
    );
  }

  saveTitleTodo(todoId: number, event: Event) {
    const title = (event.target as HTMLInputElement).value;

    this.todoList.update((prev) =>
      prev.map((item) =>
        item.id === todoId ? { ...item, title, editing: false } : item
      )
    );
  }
}
