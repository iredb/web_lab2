import { TASK_LIST, NO_TASKS, CARD_TEMPLATE, CARD_OPTIONS } from "./dom.js";
import { state } from "./state.js";

export function updateNoTasksVisibility() {
  if (!NO_TASKS) return;
  NO_TASKS.style.display = state.tasks.length === 0 ? "flex" : "none";
}

export function renderTasks() {
  if (!TASK_LIST || !CARD_TEMPLATE) return;

  TASK_LIST.querySelectorAll(".todo-card:not([data-template])").forEach((el) =>
    el.remove()
  );

  for (const task of state.tasks) {
    const card = CARD_TEMPLATE.cloneNode(true);
    card.removeAttribute("data-template");
    card.style.display = "flex";
    card.dataset.id = String(task.id);

    const titleEl = card.querySelector(".todo-title");
    const descEl = card.querySelector(".todo-description");

    if (titleEl) titleEl.textContent = task.title;
    if (descEl) descEl.textContent = task.description;

    TASK_LIST.appendChild(card);
  }

  updateNoTasksVisibility();

  if (state.optionsOpenForId != null) {
    const card = TASK_LIST.querySelector(
      `.todo-card[data-id="${state.optionsOpenForId}"]`
    );
    if (card) {
      attachOptionsUnder(card);
    } else {
      hideOptionsMenu();
    }
  }
}

export function attachOptionsUnder(card) {
  if (!CARD_OPTIONS || !TASK_LIST) return;

  if (!CARD_OPTIONS.isConnected) {
    TASK_LIST.appendChild(CARD_OPTIONS);
  }

  card.insertAdjacentElement("afterend", CARD_OPTIONS);
  CARD_OPTIONS.style.display = "flex";
  state.optionsOpenForId = card.dataset.id;
}

export function hideOptionsMenu() {
  if (!CARD_OPTIONS) return;
  state.optionsOpenForId = null;
  CARD_OPTIONS.style.display = "none";
}
