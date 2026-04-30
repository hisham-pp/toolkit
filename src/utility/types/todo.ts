import { TodoPriority } from "@/utility/enums/todo-priority";

export interface TodoProject {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface ProjectTodo {
  id: string;
  projectId: string;
  title: string;
  notes: string;
  done: boolean;
  priority: TodoPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodoWorkspace {
  projects: TodoProject[];
  todos: ProjectTodo[];
}
