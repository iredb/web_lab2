const NO_TASKS = document.querySelector(".no-tasks")
const TASK_LIST = document.querySelector(".task-list")
const FORMS = {
    create: document.querySelector('[data-form-type="create"][data-entity="task"]'),
    edit: document.querySelector('[data-form-type="edit"][data-entity="task"]')
}
const DELETE_POPUP = document.querySelector('[data-popup="delete"]');
const CARD_TEMPLATE = TASK_LIST.querySelector(".todo-card")
CARD_TEMPLATE.setAttribute("data-template", "true");
const SHARE_POPUP = document.querySelector(".share-popup");
const CARD_OPTIONS = createOptionsMenu();

const STORAGE_KEY = "WEB.LAB2";

function loadTasksFromStorage(){
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const parsed = JSON.parse(data);

        return parsed.filter(
            (task) => task && (typeof task.id === "string" || typeof task.id === "number") && typeof task.title === "string"
        );
    } catch {
        return [];
    }
}

function saveTasksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
  }
}

let tasks = []
let currentEditTaskId = null
let pendingExecutionId = null
let optionsOpenForId = null

init()

function init(){
    updateNoTasksVisibility()
    hideEditForm()
    hideDeletePopup();

    setupCreateForm();
    setupEditForm();
    setupDeleteHandler();
    setupCardInteractionDelegation();
    setupSharePopupClose();

    tasks = loadTasksFromStorage();

    renderTasks();
}

function createOptionsMenu(){
    let optionsMenu = document.querySelector(".card-options");
    if (!optionsMenu) {
        optionsMenu = document.createElement("div");
        optionsMenu.className = "card-options";
        optionsMenu.innerHTML = `
        <button class="share-button"  title="Share"></button>
        <button class="info-button"   title="Info"></button>
        <button class="edit-button"   title="Edit"></button>
        `;
    }

    optionsMenu.addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (!button) return;

        const id = optionsOpenForId;
        if (id == null) return;

        const task = tasks.find((task) => String(task.id) === String(id));
        if (!task) return;

        if (button.classList.contains("share-button")) {
            openSharePopup(task);
        } else if (button.classList.contains("info-button")) {
            alert(`${task.title}\n\n${task.description}`);
        } else if (button.classList.contains("edit-button")) {
            openEditForm(task);
        }
    });

    return optionsMenu;
}

function updateNoTasksVisibility(){
    NO_TASKS.style.display = tasks.length === 0 ? "flex" : "none";
} //q

function renderTasks(){
    TASK_LIST.querySelectorAll(".todo-card:not([data-template])").forEach((el) => el.remove());

    for (const task of tasks) {
        const card = CARD_TEMPLATE.cloneNode(true);
        card.removeAttribute("data-template");
        card.style.display = "flex";
        card.dataset.id = String(task.id);

        card.querySelector(".todo-title").textContent = task.title;
        card.querySelector(".todo-description").textContent = task.description;

        TASK_LIST.appendChild(card);
    }

    updateNoTasksVisibility();

    if (optionsOpenForId != null) {
        const card = TASK_LIST.querySelector(`.todo-card[data-id="${optionsOpenForId}"]`);
        if (card) attachOptionsUnder(card);
    else hideOptionsMenu();
  }
}

function setupCreateForm(){
    FORMS.create.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCreateTask();
    });
}

function handleCreateTask(){
    const formData = new FormData(FORMS.create);
    const title = formData.get("title").trim();
    const description = formData.get("description").trim();
    
    if (!title) {
        alert("введите title задачи");
        return;
    }
    
    const newTask = {
        id: parseInt(Date.now() + Math.random()),
        title,
        description,
    };

    console.log('new task:', newTask);
    tasks.push(newTask);
    saveTasksToStorage()
    FORMS.create.reset();
    renderTasks();
}

function setupEditForm(){
    FORMS.edit.querySelector('.confirm-edit').addEventListener('click', () => {
        handleEditTask();
    });

    FORMS.edit.querySelector('.cancel-edit').addEventListener('click', () => {
        hideEditForm();
    });
}

function openEditForm(task){
    currentEditTaskId = task.id;

    FORMS.edit.querySelector('.mini-input').value = task.title;
    FORMS.edit.querySelector('.giga-input').value = task.description;

    FORMS.edit.closest(".popup-stand").style.display = "flex";
}

function hideEditForm(){
    FORMS.edit.closest('.popup-stand').style.display = 'none';
    currentEditTask = null;
}

function handleEditTask(){
    if (currentEditTaskId == null) {
        console.log("КОСЯК В ТАСКЕ")
        hideEditForm();
        return;
    }

    const newTitle = FORMS.edit.querySelector('.mini-input').value.trim();
    const newDescription = FORMS.edit.querySelector('.giga-input').value.trim();
    
    if (!newTitle) return alert("введите title задачи")

    tasks = tasks.map((task) =>
        task.id === currentEditTaskId ? { ...task, title: newTitle, description: newDescription } : task
    );
    
    hideEditForm();
    saveTasksToStorage()
    renderTasks();
    console.log('edited task:', newTitle, newDescription);
}

function hideDeletePopup(){
    DELETE_POPUP.style.display = "none"
}

function setupDeleteHandler(){
    const confirmButton = DELETE_POPUP.querySelector('[data-action="confirm-delete"]');
    const cancelButton = DELETE_POPUP.querySelector('[data-action="cancel-delete"]');

    confirmButton.addEventListener("click", () => {
        if (pendingExecutionId != null){
            tasks = tasks.filter((task) => task.id !== pendingExecutionId);
            pendingExecutionId = null;
            if (String(optionsOpenForId) !== "" && !tasks.find((task) => task.id === optionsOpenForId)) {
                hideOptionsMenu();
            }
            saveTasksToStorage()
            renderTasks();
        }
        hideDeletePopup();
    })

    cancelButton.addEventListener("click", () => {
        pendingExecutionId = null;
        hideDeletePopup();
    })

    DELETE_POPUP.addEventListener("click", (e) => {
        if (e.target === DELETE_POPUP){
            pendingExecutionId = null;
            hideDeletePopup();
        }
    })
}

function openDeletePopup(id){
    pendingExecutionId = id;
    DELETE_POPUP.style.display = "flex";
}

function hideDeletePopup(){
    DELETE_POPUP.style.display = "none";
}

function setupCardInteractionDelegation(){
    TASK_LIST.addEventListener("click", (e) => {
        const del = e.target.closest(".delete-button");
        if (del) {
            const card = del.closest(".todo-card");
            if (!card) return;
            openDeletePopup(Number(card.dataset.id));
            return;
        }

        const card = e.target.closest(".todo-card");
        if (!card || card.hasAttribute("data-template")) return;

        const id = card.dataset.id;
        if (optionsOpenForId === id) {
            hideOptionsMenu();
        } else {
            attachOptionsUnder(card);
            optionsOpenForId = id;
        }
    })
}

function attachOptionsUnder(card){
    if (!CARD_OPTIONS.isConnected) TASK_LIST.appendChild(CARD_OPTIONS);

    card.insertAdjacentElement("afterend", CARD_OPTIONS);
    CARD_OPTIONS.style.display = "flex";
    optionsOpenForId = card.dataset.id;
}

function hideOptionsMenu(){
    optionsOpenForId = null;
    CARD_OPTIONS.style.display = "none";
}

function openSharePopup(task) {
    if (!SHARE_POPUP) {
        console.warn("Share popup not found in DOM. Uncomment it in HTML to enable. See page1.html.");
        alert("Share popup не подключён в HTML (закомментирован).");
        return;
    }
    const popup = SHARE_POPUP.closest(".popup-stand");
    if (popup) popup.style.display = "flex";
}

function setupSharePopupClose() {
    const popup = SHARE_POPUP.closest(".popup-stand");

    popup.addEventListener("click", (e) => {
        if (e.target === popup) popup.style.display = "none";
    });
}