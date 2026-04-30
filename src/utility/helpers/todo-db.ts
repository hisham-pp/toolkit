import { TODO_DB } from "@/utility/constants/storage-keys";
import { TodoWorkspace } from "@/utility/types/todo";

export type { ProjectTodo, TodoProject, TodoWorkspace } from "@/utility/types/todo";

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

    const request = indexedDb.open(TODO_DB.dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TODO_DB.storeName)) {
        db.createObjectStore(TODO_DB.storeName);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

export async function loadTodoWorkspace(): Promise<TodoWorkspace> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(TODO_DB.storeName, "readonly");
    const store = tx.objectStore(TODO_DB.storeName);
    const request = store.get(TODO_DB.recordKey);

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
    const tx = db.transaction(TODO_DB.storeName, "readwrite");
    const store = tx.objectStore(TODO_DB.storeName);

    store.put(workspace, TODO_DB.recordKey);

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save workspace."));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted."));
  });
}
