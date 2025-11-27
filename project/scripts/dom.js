export const NO_TASKS = document.querySelector(".no-tasks");
export const TASK_LIST = document.querySelector(".task-list");

export const FORMS = {
  create: document.querySelector(
    '[data-form-type="create"][data-entity="task"]'
  ),
  edit: document.querySelector(
    '[data-form-type="edit"][data-entity="task"]'
  ),
};

export const DELETE_POPUP = document.querySelector('[data-popup="delete"]');
export const SHARE_POPUP = document.querySelector(".share-popup");

const template = TASK_LIST
  ? TASK_LIST.querySelector(".todo-card")
  : null;

if (template) {
  template.setAttribute("data-template", "true");
}

export const CARD_TEMPLATE = template;

export const CARD_OPTIONS = document.querySelector(".card-options");
