import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TaskService, Task } from './task.service';

// 🟢 Prism global declaration
declare var Prism: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit, AfterViewChecked {
  task = '';
  taskContent = '';
  selectedImage: string | ArrayBuffer | null = null;
  tasks: Task[] = [];
  
  // 🟢 To prevent multiple redundant highlight calls
  private highlighted = false;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.highlighted = false; // 🟢 Reset highlight trigger
      },
      error: (err) => console.error('Failed to load tasks:', err)
    });
  }

  addTask() {
    if (this.task.trim()) {
      const newTask: Task = {
        name: this.task.trim(),
        completed: false,
        // 🟢 Escape HTML to avoid broken tags
        content: this.escapeHTML(this.taskContent.trim() || ''),
        image: this.selectedImage ? String(this.selectedImage) : ''
      };

      this.taskService.addTask(newTask).subscribe(() => this.loadTasks());

      // Reset fields
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

  // 🟢 Simple escape to prevent HTML injection
  escapeHTML(text: string): string {
    return text.replace(/[&<>]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[char] || char));
  }

  // 🟢 Highlight code after Angular updates DOM
  ngAfterViewChecked() {
    if (typeof Prism !== 'undefined' && !this.highlighted) {
      Prism.highlightAll();
      this.highlighted = true;
    }
  }
}
