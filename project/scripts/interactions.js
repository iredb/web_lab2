import { state } from "./state.js";
import {
  TASK_LIST,
  FORMS,
  DELETE_POPUP,
  SHARE_POPUP,
  CARD_OPTIONS,
} from "./dom.js";
import { loadTasksFromStorage, saveTasksToStorage } from "./storage.js";
import {
  renderTasks,
  updateNoTasksVisibility,
  attachOptionsUnder,
  hideOptionsMenu,
} from "./tasksView.js";

export function initApp() {
  updateNoTasksVisibility();
  hideEditForm();
  hideDeletePopup();

  setupCreateForm();
  setupEditForm();
  setupDeleteHandler();
  setupCardInteractionDelegation();
  setupSharePopupClose();
  setupOptionsMenuInteraction();

  state.tasks = loadTasksFromStorage();
  renderTasks();
}

function setupCreateForm() {
  if (!FORMS.create) return;

  FORMS.create.addEventListener("submit", (e) => {
    e.preventDefault();
    handleCreateTask();
  });
}

function handleCreateTask() {
  const formData = new FormData(FORMS.create);
  const rawTitle = formData.get("title");
  const rawDescription = formData.get("description");

  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const description =
    typeof rawDescription === "string" ? rawDescription.trim() : "";

  if (!title) {
    alert("введите title задачи");
    return;
  }

  const newTask = {
    id: parseInt(Date.now() + Math.random(), 10),
    title,
    description,
  };

  console.log("new task:", newTask);
  state.tasks.push(newTask);
  saveTasksToStorage(state.tasks);
  FORMS.create.reset();
  renderTasks();
}

function setupEditForm() {
  if (!FORMS.edit) return;

  const confirmButton = FORMS.edit.querySelector(".confirm-edit");
  const cancelButton = FORMS.edit.querySelector(".cancel-edit");

  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      handleEditTask();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      hideEditForm();
    });
  }
}

function openEditForm(task) {
  if (!FORMS.edit) return;

  state.currentEditTaskId = task.id;

  const titleInput = FORMS.edit.querySelector(".mini-input");
  const descriptionInput = FORMS.edit.querySelector(".giga-input");

  if (titleInput) titleInput.value = task.title ?? "";
  if (descriptionInput) descriptionInput.value = task.description ?? "";

  const popup = FORMS.edit.closest(".popup-stand");
  if (popup) {
    popup.style.display = "flex";
  }
}

function hideEditForm() {
  if (!FORMS.edit) return;

  const popup = FORMS.edit.closest(".popup-stand");
  if (popup) {
    popup.style.display = "none";
  }

  state.currentEditTaskId = null;
}

function handleEditTask() {
  if (state.currentEditTaskId == null) {
    console.log("КОСЯК В ТАСКЕ");
    hideEditForm();
    return;
  }

  if (!FORMS.edit) return;

  const titleInput = FORMS.edit.querySelector(".mini-input");
  const descriptionInput = FORMS.edit.querySelector(".giga-input");

  const newTitle = titleInput ? titleInput.value.trim() : "";
  const newDescription = descriptionInput
    ? descriptionInput.value.trim()
    : "";

  if (!newTitle) {
    alert("введите title задачи");
    return;
  }

  state.tasks = state.tasks.map((task) =>
    task.id === state.currentEditTaskId
      ? { ...task, title: newTitle, description: newDescription }
      : task
  );

  hideEditForm();
  saveTasksToStorage(state.tasks);
  renderTasks();
  console.log("edited task:", newTitle, newDescription);
}

function hideDeletePopup() {
  if (!DELETE_POPUP) return;
  DELETE_POPUP.style.display = "none";
}

function setupDeleteHandler() {
  if (!DELETE_POPUP) return;

  const confirmButton = DELETE_POPUP.querySelector(
    '[data-action="confirm-delete"]'
  );
  const cancelButton = DELETE_POPUP.querySelector(
    '[data-action="cancel-delete"]'
  );

  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      if (state.pendingExecutionId != null) {
        state.tasks = state.tasks.filter(
          (task) => task.id !== state.pendingExecutionId
        );
        state.pendingExecutionId = null;

        if (
          String(state.optionsOpenForId) !== "" &&
          !state.tasks.find((task) => task.id === state.optionsOpenForId)
        ) {
          hideOptionsMenu();
        }

        saveTasksToStorage(state.tasks);
        renderTasks();
      }

      hideDeletePopup();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      state.pendingExecutionId = null;
      hideDeletePopup();
    });
  }

  DELETE_POPUP.addEventListener("click", (e) => {
    if (e.target === DELETE_POPUP) {
      state.pendingExecutionId = null;
      hideDeletePopup();
    }
  });
}

function openDeletePopup(id) {
  if (!DELETE_POPUP) return;
  state.pendingExecutionId = id;
  DELETE_POPUP.style.display = "flex";
}

function setupCardInteractionDelegation() {
  if (!TASK_LIST) return;

  TASK_LIST.addEventListener("click", (e) => {
    const deleteButton = e.target.closest(".delete-button");
    if (deleteButton) {
      const card = deleteButton.closest(".todo-card");
      if (!card) return;
      const id = Number(card.dataset.id);
      openDeletePopup(id);
      return;
    }

    const card = e.target.closest(".todo-card");
    if (!card || card.hasAttribute("data-template")) return;

    const id = card.dataset.id;
    if (state.optionsOpenForId === id) {
      hideOptionsMenu();
    } else {
      attachOptionsUnder(card);
      state.optionsOpenForId = id;
    }
  });
}

function setupOptionsMenuInteraction() {
  if (!CARD_OPTIONS) return;

  CARD_OPTIONS.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    const id = state.optionsOpenForId;
    if (id == null) return;

    const task = state.tasks.find(
      (task) => String(task.id) === String(id)
    );
    if (!task) return;

    if (button.classList.contains("share-button")) {
      openSharePopup(task);
    } else if (button.classList.contains("info-button")) {
      alert(`${task.title}\n\n${task.description}`);
    } else if (button.classList.contains("edit-button")) {
      openEditForm(task);
    }
  });
}

function openSharePopup(task) {
  const popup = SHARE_POPUP.closest(".popup-stand");
  if (popup) {
    popup.style.display = "flex";
  }
}

function setupSharePopupClose() {
  if (!SHARE_POPUP) return;

  const popup = SHARE_POPUP.closest(".popup-stand");
  if (!popup) return;

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
}
