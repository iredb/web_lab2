const STORAGE_KEY = "WEB.LAB2";

export function loadTasksFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);

    return parsed.filter(
      (task) =>
        task &&
        (typeof task.id === "string" || typeof task.id === "number") &&
        typeof task.title === "string"
    );
  } catch {
    return [];
  }
}

export function saveTasksToStorage(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ну и ладно.
  }
}
