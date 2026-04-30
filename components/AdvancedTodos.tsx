"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCheck,
  Circle,
  FolderPlus,
  Layers3,
  ListTodo,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadTodoWorkspace,
  ProjectTodo,
  saveTodoWorkspace,
  TodoProject,
} from "@/lib/todo-db";

const PROJECT_COLORS = [
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#8b5cf6",
  "#f43f5e",
  "#eab308",
];

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function formatDateLabel(value: string | null) {
  if (!value) return "No due date";
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

export default function AdvancedTodos() {
  const [projects, setProjects] = useState<TodoProject[]>([]);
  const [todos, setTodos] = useState<ProjectTodo[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDrafts, setProjectDrafts] = useState<Record<string, string>>({});
  const [todoTitle, setTodoTitle] = useState("");
  const [todoNotes, setTodoNotes] = useState("");
  const [todoPriority, setTodoPriority] = useState<ProjectTodo["priority"]>("medium");
  const [todoDueDate, setTodoDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "done">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [projectError, setProjectError] = useState("");
  const [renameErrors, setRenameErrors] = useState<Record<string, string>>({});
  const [todoError, setTodoError] = useState("");

  useEffect(() => {
    let active = true;

    loadTodoWorkspace()
      .then((workspace) => {
        if (!active) return;
        setProjects(workspace.projects);
        setTodos(workspace.todos);
        setSelectedProjectId(workspace.projects[0]?.id ?? null);
      })
      .catch(() => {
        if (!active) return;
        setSaveState("error");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      saveTodoWorkspace({ projects, todos })
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [projects, todos, isLoading]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const projectTodos = useMemo(() => {
    if (!selectedProjectId) return [];

    return todos
      .filter((todo) => todo.projectId === selectedProjectId)
      .filter((todo) => {
        if (statusFilter === "open") return !todo.done;
        if (statusFilter === "done") return todo.done;
        return true;
      })
      .filter((todo) => {
        const haystack = `${todo.title} ${todo.notes}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        if (a.done !== b.done) return Number(a.done) - Number(b.done);

        const priorityWeight = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [todos, selectedProjectId, statusFilter, search]);

  const projectStats = useMemo(() => {
    return projects.map((project) => {
      const items = todos.filter((todo) => todo.projectId === project.id);
      const completed = items.filter((todo) => todo.done).length;
      return {
        projectId: project.id,
        total: items.length,
        completed,
        open: items.length - completed,
      };
    });
  }, [projects, todos]);

  const totalOpen = useMemo(() => todos.filter((todo) => !todo.done).length, [todos]);

  const validateProjectName = (name: string, currentProjectId?: string) => {
    const trimmed = name.trim();

    if (!trimmed) return "Project name is required.";
    if (trimmed.length < 3) return "Project name must be at least 3 characters.";
    if (trimmed.length > 40) return "Project name must stay under 40 characters.";

    const duplicate = projects.some(
      (project) =>
        project.id !== currentProjectId &&
        project.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicate) return "Project name already exists.";
    return "";
  };

  const validateTodoInput = () => {
    if (!selectedProjectId) return "Select a project before adding a todo.";

    const trimmedTitle = todoTitle.trim();
    const trimmedNotes = todoNotes.trim();

    if (!trimmedTitle) return "Todo title is required.";
    if (trimmedTitle.length < 3) return "Todo title must be at least 3 characters.";
    if (trimmedTitle.length > 120) return "Todo title must stay under 120 characters.";
    if (trimmedNotes.length > 300) return "Todo notes must stay under 300 characters.";

    const duplicate = todos.some(
      (todo) =>
        todo.projectId === selectedProjectId &&
        todo.title.trim().toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (duplicate) return "A todo with this title already exists in the project.";
    return "";
  };

  const addProject = () => {
    const name = projectName.trim();
    const error = validateProjectName(name);
    if (error) {
      setProjectError(error);
      return;
    }

    const project: TodoProject = {
      id: createId("project"),
      name,
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [project, ...prev]);
    setSelectedProjectId(project.id);
    setProjectName("");
    setProjectError("");
  };

  const renameProject = (projectId: string) => {
    const nextName = (projectDrafts[projectId] ?? "").trim();
    const error = validateProjectName(nextName, projectId);
    if (error) {
      setRenameErrors((prev) => ({ ...prev, [projectId]: error }));
      return;
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, name: nextName } : project
      )
    );
    setRenameErrors((prev) => ({ ...prev, [projectId]: "" }));
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    setTodos((prev) => prev.filter((todo) => todo.projectId !== projectId));
    setSelectedProjectId((prev) => {
      if (prev !== projectId) return prev;
      const next = projects.find((project) => project.id !== projectId);
      return next?.id ?? null;
    });
  };

  const addTodo = () => {
    const error = validateTodoInput();
    if (error) {
      setTodoError(error);
      return;
    }

    if (!selectedProjectId) {
      setTodoError("Select a project before adding a todo.");
      return;
    }

    const now = new Date().toISOString();
    const todo: ProjectTodo = {
      id: createId("todo"),
      projectId: selectedProjectId,
      title: todoTitle.trim(),
      notes: todoNotes.trim(),
      done: false,
      priority: todoPriority,
      dueDate: todoDueDate || null,
      createdAt: now,
      updatedAt: now,
    };

    setTodos((prev) => [todo, ...prev]);
    setTodoTitle("");
    setTodoNotes("");
    setTodoPriority("medium");
    setTodoDueDate("");
    setTodoError("");
  };

  const updateTodo = (todoId: string, updater: (todo: ProjectTodo) => ProjectTodo) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? updater({ ...todo, updatedAt: new Date().toISOString() })
          : todo
      )
    );
  };

  const removeTodo = (todoId: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
  };

  return (
    <section className="space-y-10">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-900" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 whitespace-nowrap">
          Local Mission Board
        </h3>
        <div className="h-px flex-1 bg-zinc-900" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Projects</p>
                <h2 className="text-3xl font-black tracking-tight text-white mt-3">Dynamic local workspace</h2>
              </div>
              <div className="w-14 h-14 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Layers3 className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-[1.5rem] border border-zinc-800 bg-[#111113] p-4">
                <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-black">Projects</div>
                <div className="text-3xl font-black text-white mt-3">{projects.length}</div>
              </div>
              <div className="rounded-[1.5rem] border border-zinc-800 bg-[#111113] p-4">
                <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-black">Open</div>
                <div className="text-3xl font-black text-white mt-3">{totalOpen}</div>
              </div>
              <div className="rounded-[1.5rem] border border-zinc-800 bg-[#111113] p-4">
                <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-black">Storage</div>
                <div className="text-sm font-black text-primary mt-5">IndexedDB</div>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                value={projectName}
                onChange={(event) => {
                  setProjectName(event.target.value);
                  if (projectError) setProjectError("");
                }}
                placeholder="Add a new project"
                className={cn(
                  "flex-1 h-14 rounded-2xl bg-[#0F0F10] border px-5 text-sm text-white outline-none focus:border-primary",
                  projectError ? "border-red-500/50" : "border-zinc-800"
                )}
              />
              <button
                type="button"
                onClick={addProject}
                className="h-14 px-5 rounded-2xl bg-white text-black hover:bg-primary hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Add
              </button>
            </div>

            {projectError ? (
              <p className="text-[11px] text-red-400 font-bold">{projectError}</p>
            ) : null}

            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
              {saveState === "saving" && "Saving locally..."}
              {saveState === "saved" && "Saved locally"}
              {saveState === "error" && "Storage unavailable"}
              {saveState === "idle" && "Ready"}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 space-y-4">
            {isLoading ? (
              <div className="text-sm text-zinc-500 p-6">Loading local workspace...</div>
            ) : projects.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-zinc-800 p-8 text-center space-y-3">
                <BriefcaseBusiness className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-sm text-zinc-400 font-bold">No projects yet.</p>
                <p className="text-[11px] text-zinc-600">Create one above. Everything stays local in IndexedDB.</p>
              </div>
            ) : (
              projects.map((project) => {
                const stats = projectStats.find((item) => item.projectId === project.id);
                const isSelected = project.id === selectedProjectId;

                return (
                  <div
                    key={project.id}
                    className={cn(
                      "rounded-[1.75rem] border p-5 transition-all",
                      isSelected
                        ? "border-primary/40 bg-primary/5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
                        : "border-zinc-800 bg-[#111113]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedProjectId(project.id)}
                      className="w-full text-left space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-3 h-12 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <div className="min-w-0">
                            <p className="text-white font-black tracking-tight truncate">{project.name}</p>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 mt-1">
                              {stats?.open ?? 0} open / {stats?.total ?? 0} total
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-white">{stats?.completed ?? 0}</p>
                          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">Done</p>
                        </div>
                      </div>
                    </button>

                    <div className="flex gap-2 mt-4">
                      <input
                        value={projectDrafts[project.id] ?? project.name}
                        onChange={(event) =>
                          {
                            setProjectDrafts((prev) => ({
                              ...prev,
                              [project.id]: event.target.value,
                            }));
                            setRenameErrors((prev) => ({ ...prev, [project.id]: "" }));
                          }
                        }
                        className={cn(
                          "flex-1 h-11 rounded-xl bg-black/20 border px-4 text-xs text-zinc-300 outline-none focus:border-primary",
                          renameErrors[project.id] ? "border-red-500/50" : "border-zinc-800"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => renameProject(project.id)}
                        className="h-11 px-4 rounded-xl border border-zinc-800 hover:border-primary/40 text-zinc-400 hover:text-white transition-colors"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProject(project.id)}
                        className="h-11 px-4 rounded-xl border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {renameErrors[project.id] ? (
                      <p className="text-[11px] text-red-400 font-bold mt-3">{renameErrors[project.id]}</p>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                  {selectedProject ? "Active project" : "Select a project"}
                </p>
                <h2 className="text-4xl font-black text-white tracking-tight mt-3">
                  {selectedProject?.name ?? "No project selected"}
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {(["all", "open", "done"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "h-11 px-5 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] transition-colors",
                      statusFilter === status
                        ? "border-primary bg-primary text-white"
                        : "border-zinc-800 text-zinc-500 hover:text-white"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_0.9fr_0.9fr_auto] gap-3">
              <input
                value={todoTitle}
                onChange={(event) => {
                  setTodoTitle(event.target.value);
                  if (todoError) setTodoError("");
                }}
                placeholder="New todo title"
                disabled={!selectedProject}
                className={cn(
                  "h-14 rounded-2xl bg-[#0F0F10] border px-5 text-sm text-white outline-none focus:border-primary disabled:opacity-50",
                  todoError ? "border-red-500/50" : "border-zinc-800"
                )}
              />
              <input
                value={todoNotes}
                onChange={(event) => {
                  setTodoNotes(event.target.value);
                  if (todoError) setTodoError("");
                }}
                placeholder="Notes / context"
                disabled={!selectedProject}
                className={cn(
                  "h-14 rounded-2xl bg-[#0F0F10] border px-5 text-sm text-white outline-none focus:border-primary disabled:opacity-50",
                  todoError ? "border-red-500/50" : "border-zinc-800"
                )}
              />
              <select
                value={todoPriority}
                onChange={(event) => setTodoPriority(event.target.value as ProjectTodo["priority"])}
                disabled={!selectedProject}
                className="h-14 rounded-2xl bg-[#0F0F10] border border-zinc-800 px-5 text-sm text-white outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <input
                type="date"
                value={todoDueDate}
                onChange={(event) => setTodoDueDate(event.target.value)}
                disabled={!selectedProject}
                className="h-14 rounded-2xl bg-[#0F0F10] border border-zinc-800 px-5 text-sm text-white outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addTodo}
                disabled={!selectedProject}
                className="h-14 px-6 rounded-2xl bg-white text-black hover:bg-primary hover:text-white transition-colors font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {todoError ? (
              <p className="text-[11px] text-red-400 font-bold">{todoError}</p>
            ) : (
              <p className="text-[11px] text-zinc-600 font-bold">
                Project names: 3-40 chars. Todo titles: 3-120 chars. Notes: max 300 chars.
              </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search todos in this project"
                className="h-12 rounded-2xl bg-[#0F0F10] border border-zinc-800 px-5 text-sm text-white outline-none focus:border-primary"
              />
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-600 font-black">
                <CalendarClock className="w-4 h-4 text-primary" />
                Local only. No sync.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selectedProject == null ? (
              <div className="rounded-[2.5rem] border border-dashed border-zinc-800 bg-zinc-950 p-12 text-center">
                <ListTodo className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                <p className="text-xl font-black text-white">Choose a project to start tracking work.</p>
              </div>
            ) : projectTodos.length === 0 ? (
              <div className="rounded-[2.5rem] border border-dashed border-zinc-800 bg-zinc-950 p-12 text-center">
                <CheckCheck className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                <p className="text-xl font-black text-white">No todos match this view.</p>
                <p className="text-sm text-zinc-500 mt-2">Add one above or loosen the filters.</p>
              </div>
            ) : (
              projectTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "rounded-[2rem] border bg-zinc-950 p-6 flex flex-col lg:flex-row lg:items-start gap-5",
                    todo.done ? "border-green-500/20" : "border-zinc-900"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => updateTodo(todo.id, (current) => ({ ...current, done: !current.done }))}
                    className="shrink-0 mt-1"
                    aria-label={todo.done ? "Mark todo as open" : "Mark todo as done"}
                  >
                    {todo.done ? (
                      <CheckCheck className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-zinc-600" />
                    )}
                  </button>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div>
                        <h4 className={cn("text-xl font-black tracking-tight", todo.done ? "text-zinc-500 line-through" : "text-white")}>
                          {todo.title}
                        </h4>
                        {todo.notes ? (
                          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{todo.notes}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={cn(
                            "px-3 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-black border",
                            todo.priority === "high" && "border-red-500/30 text-red-300 bg-red-500/10",
                            todo.priority === "medium" && "border-amber-500/30 text-amber-300 bg-amber-500/10",
                            todo.priority === "low" && "border-sky-500/30 text-sky-300 bg-sky-500/10"
                          )}
                        >
                          {todo.priority}
                        </span>
                        <span className="px-3 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-black border border-zinc-800 text-zinc-500">
                          {formatDateLabel(todo.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={todo.priority}
                        onChange={(event) =>
                          updateTodo(todo.id, (current) => ({
                            ...current,
                            priority: event.target.value as ProjectTodo["priority"],
                          }))
                        }
                        className="h-11 rounded-xl bg-[#0F0F10] border border-zinc-800 px-4 text-xs text-white outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <input
                        type="date"
                        value={todo.dueDate ?? ""}
                        onChange={(event) =>
                          updateTodo(todo.id, (current) => ({
                            ...current,
                            dueDate: event.target.value || null,
                          }))
                        }
                        className="h-11 rounded-xl bg-[#0F0F10] border border-zinc-800 px-4 text-xs text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeTodo(todo.id)}
                        className="h-11 px-4 rounded-xl border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
