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
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodoWorkspace {
  projects: TodoProject[];
  todos: ProjectTodo[];
}

const DB_NAME = "devhub-workspace";
const STORE_NAME = "workspace";
const RECORD_KEY = "project-todos";

const DEFAULT_WORKSPACE: TodoWorkspace = {
  projects: [],
  todos: [],
};

function getIndexedDb() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return null;
  }

  return window.indexedDB;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const indexedDb = getIndexedDb();

    if (!indexedDb) {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }

    const request = indexedDb.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

export async function loadTodoWorkspace(): Promise<TodoWorkspace> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(RECORD_KEY);

    request.onsuccess = () => {
      const result = request.result as TodoWorkspace | undefined;
      resolve(result ?? DEFAULT_WORKSPACE);
    };
    request.onerror = () => reject(request.error ?? new Error("Failed to load workspace."));
    tx.oncomplete = () => db.close();
  });
}

export async function saveTodoWorkspace(workspace: TodoWorkspace): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.put(workspace, RECORD_KEY);

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save workspace."));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted."));
  });
}
