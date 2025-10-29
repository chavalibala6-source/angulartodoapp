import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TaskService, Task } from './task.service';
import { SafeHtmlPipe } from './safe-html.pipe';  // ✅ fixed import path

declare var Prism: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SafeHtmlPipe], // ✅ added here
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit, AfterViewChecked {
  task = '';
  taskContent = '';
  selectedImage: string | ArrayBuffer | null = null;
  tasks: Task[] = [];
  private highlighted = false;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.highlighted = false;
      },
      error: (err) => console.error('Failed to load tasks:', err)
    });
  }

  addTask() {
    if (this.task.trim()) {
      const newTask: Task = {
        name: this.task.trim(),
        completed: false,
        content: this.taskContent.trim() || '', // ✅ no escaping
        image: this.selectedImage ? String(this.selectedImage) : ''
      };

      this.taskService.addTask(newTask).subscribe(() => this.loadTasks());
      this.task = '';
      this.taskContent = '';
      this.selectedImage = null;
      (document.querySelector('#imageInput') as HTMLInputElement).value = '';
    }
  }

  toggleTaskComplete(task: Task) {
    task.completed = !task.completed;
    this.taskService.updateTask(task).subscribe();
  }

  removeTask(index: number) {
    const task = this.tasks[index];
    if (!task._id) return;
    this.taskService.deleteTask(task._id).subscribe(() => this.loadTasks());
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.selectedImage = reader.result);
      reader.readAsDataURL(file);
    }
  }

  makeBold() {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = `${before}<b>${selectedText}</b>${after}`;
    this.taskContent = textarea.value;
    textarea.selectionStart = start + 3;
    textarea.selectionEnd = end + 3;
    textarea.focus();
  }

  ngAfterViewChecked() {
    if (typeof Prism !== 'undefined' && !this.highlighted) {
      Prism.highlightAll();
      this.highlighted = true;
    }
  }
}
