let currentDraggedElement;
let toDoArray = [];
let inProgressArray = [];
let awaitFeedbackArray = [];
let doneArray = [];
let oldArray = [];
let newArray = [];
let oldCategory;
let oldCategoryName;
let newCategory;
let newCategoryName;
let currentCardId;
let currentTaskData = {};
let currentTaskCardId;
let currentArrayName;
let currentArray = [];
let currentDragFieldId;
let isBorderActive = false
let toDoArraySearch = [];
let inProgressArraySearch = [];
let awaitFeedbackArraySearch = [];
let doneArraySearch = [];
let originDragField = null;
let searchMode = "false";
let data = {
    category: "",
    taskType: "",
    taskTitle: "",
    taskDescription: "",
    taskPriority: "",
    numberOfSubtasks: 0,
    numberOfCompletedSubtasks: 0,
    assignedContacts: [],
    subtasks: []
}
let allContacts = [];
let allTasks = [];
let categoryFromClickedButton = "";
const BASE_URL = "https://join-guast-account-default-rtdb.europe-west1.firebasedatabase.app/";
const arrayNames = ["toDoArray", "inProgressArray", "awaitFeedbackArray", "doneArray"];
const searchArrayNames = ["toDoArraySearch", "inProgressArraySearch", "awaitFeedbackArraySearch", "doneArraySearch"];
const searchArrays = {
    toDoArraySearch: toDoArraySearch,
    inProgressArraySearch: inProgressArraySearch,
    awaitFeedbackArraySearch: awaitFeedbackArraySearch,
    doneArraySearch: doneArraySearch
};
const dragFieldIds = ["to-do-drag-field", "in-progress-drag-field", "await-feedback-drag-field", "done-drag-field"];
const categorys = ["To do", "In progress", "Await feedback", "Done"];
const categorysObject = {
    toDos: "To do",
    inProgress: "In progress",
    awaitFeedback: "Await feedback",
    done: "Done"
}
const searchArraysBasedOnCategory = {
    toDos: toDoArraySearch,
    inProgress: inProgressArraySearch,
    awaitFeedback: awaitFeedbackArraySearch,
    done: doneArraySearch
}
const arrays = {
    toDoArray: toDoArray,
    inProgressArray: inProgressArray,
    awaitFeedbackArray: awaitFeedbackArray,
    doneArray: doneArray
};

/**
 * Initializes the task board by resetting UI elements, synchronizing contacts with tasks,
 * and loading task data from the database into their respective arrays and drag-and-drop fields.
 * It also sets the height for drag fields and clears the session storage task category.
 *
 * This function performs asynchronous operations, including reading task data from the database
 * and synchronizing contacts with tasks. It ensures that the UI is updated and prepared for
 * user interaction.
 *
 * @async
 * @returns {Promise<void>} Resolves when all asynchronous operations (such as loading tasks and synchronizing contacts) are complete.
 */
async function init() {
    setSearchModeFalseAndChangeImg();
    await syncAllContactsWithTasks(localStorage.getItem("userId"));
    await readFromDatabase(localStorage.getItem("userId"), "toDos", toDoArray, "to-do-drag-field");
    await readFromDatabase(localStorage.getItem("userId"), "inProgress", inProgressArray, "in-progress-drag-field");
    await readFromDatabase(localStorage.getItem("userId"), "awaitFeedback", awaitFeedbackArray, "await-feedback-drag-field");
    await readFromDatabase(localStorage.getItem("userId"), "done", doneArray, "done-drag-field");
    setHeightForDragFields();
    readTaskFromSessionAndFindTask()
    removeSessionStorageTaskCategory()
}

/**
 * Saves the ID of the currently clicked or interacted card.
 * This function is typically used to capture the ID of a task card during an event (e.g., a click).
 *
 * @param {Event} event - The event triggered by interacting with the card (e.g., click event).
 * @returns {void} This function does not return any value.
 */
function saveCurrentCardId(event) {
    currentCardId = event.currentTarget.id;
}

/**
 * Toggles the visibility of the "big task card" overlay by adding or removing the "d-none" class.
 * This function is typically used to show or hide the large task card overlay.
 *
 * @returns {void} This function does not return any value.
 */
function toggleDnoneBigTaskCard() {
    document.getElementById("big-task-card__overlay").classList.toggle("d-none");
}

/**
 * Adds a sliding effect to the "big task card" box by adding the "slide-back" class,
 * waits for a brief moment, and then hides the big task card overlay and removes the sliding effect.
 *
 * @returns {void} This function does not return any value.
 */
function addClassSlideBack() {
    document.getElementById("big-task-card__box").classList.add("slide-back")
    setTimeout(() => {
        toggleDnoneBigTaskCard();
        document.getElementById("big-task-card__box").classList.remove("slide-back")
        clearTimeout();
    }, 120);
}

/**
 * Toggles the visibility of three elements (a rectangle, a close rectangle, and a hook) 
 * by adding or removing the "d-none" class. This is typically used to show or hide UI elements.
 *
 * @param {string} idRectangleOpen - The ID of the rectangle element that should be shown or hidden.
 * @param {string} idRectangleClose - The ID of the rectangle element (close) that should be shown or hidden.
 * @param {string} idHook - The ID of the hook element that should be shown or hidden.
 * @returns {void} This function does not return any value.
 */
function toggleDnoneCheckbox(idRectangleOpen, idRectangleClose, idHook) {
    let rectangleOpen = document.getElementById(idRectangleOpen);
    let rectangleClose = document.getElementById(idRectangleClose);
    let hook = document.getElementById(idHook);
    rectangleOpen.classList.toggle("d-none");
    rectangleClose.classList.toggle("d-none");
    hook.classList.toggle("d-none");
}

/**
 * Changes the category of a task by finding the task object based on the task card's ID.
 * This function retrieves the task object from the `toDoArray` based on the task card's ID.
 *
 * @param {Event} event - The event triggered by the action on the task card.
 * @returns {void} This function does not return any value. It modifies the task data by retrieving the task object.
 */
function changeTaskCategoryinDatabase(event) {
    taskCardId = event.currentTarget.id;
    taskCardObject = toDoArray.find(element => element.id == taskCardId);
}

/**
 * Adds a slide-back animation to the add-task box and hides the overlay after the animation.
 * The function triggers a CSS animation by adding the `slide-back` class, waits for 120ms,
 * then toggles the visibility of the overlay and removes the animation class.
 *
 * @returns {void} This function does not return a value.
 */
function addTaskBoxAddClassSlideBack() {
    document.getElementById("add-task__box").classList.add("slide-back")
    setTimeout(() => {
        toggleDnoneAddTaskOverlay()
        document.getElementById("add-task__box").classList.remove("slide-back")
        clearTimeout();
    }, 120);
}

/**
 * Toggles the visibility of the add-task overlay by adding or removing the `d-none` class.
 * This function is typically used to show or hide the overlay for creating a new task.
 *
 * @returns {void} This function does not return a value.
 */
function toggleDnoneAddTaskOverlay() {
    document.getElementById("add-task__overlay").classList.toggle("d-none");
}

/**
 * Sets the height of all drag field elements.
 * If the viewport width is below 1310px, all drag fields are set to auto height.
 * Otherwise, all drag fields are adjusted to match the height of the tallest one.
 *
 * @returns {void} This function does not return a value.
 */
function setHeightForDragFields() {
    const dragFields = document.querySelectorAll('.drag-field');
    if (window.innerWidth < 1310) {
        dragFields.forEach(dragField => dragField.style.height = 'auto');
        return;
    }
    equalizeDragFieldHeights(dragFields)
}

/**
 * Sets all given drag field elements to the height of the tallest one.
 * First resets all heights to auto to calculate actual scrollHeight,
 * then applies the maximum height found to all fields.
 *
 * @param {NodeListOf<HTMLElement>} dragFields - A list of drag field elements whose heights should be equalized.
 * @returns {void} This function does not return a value.
 */
function equalizeDragFieldHeights(dragFields) {
    let maxHeight = 0;
    dragFields.forEach(dragField => dragField.style.height = 'auto');
    dragFields.forEach(dragField => {
        maxHeight = Math.max(maxHeight, dragField.scrollHeight);
    });
    dragFields.forEach(dragField => {
        dragField.style.height = `${maxHeight}px`;
    });
}

/**
 * Initializes the task overlay creation process. Validates input fields and the date format, then proceeds to save the task 
 * if all validations are successful. Displays relevant feedback messages if validation fails.
 * 
 * @function createTaskOverlay
 * @returns {void} This function does not return any value.
 * @throws {Error} Throws an error if the date format is invalid or other input errors occur.
 */
function createTaskOverlay() {
    removeError();
    let valid = validateInputs();
    let validDateFormat = testDate();
    let titleInput = document.getElementById("title");
    let descriptionInput = document.getElementById("description");
    validateAndSaveTask(valid, validDateFormat, titleInput, descriptionInput);
}

/**
 * Validates the task input and date format, and then saves the task if all validations pass. 
 * If validation fails, it triggers error handling and shows relevant feedback.
 *
 * @function validateAndSaveTask
 * @param {boolean} valid - A boolean indicating whether the input fields are valid.
 * @param {boolean} validDateFormat - A boolean indicating whether the date format is valid.
 * @param {HTMLInputElement} titleInput - The input element for the task title.
 * @param {HTMLInputElement} descriptionInput - The input element for the task description.
 * @returns {void} This function does not return any value.
 * @throws {Error} If validation fails, an error will be thrown and feedback will be displayed.
 */
function validateAndSaveTask(valid, validDateFormat, titleInput, descriptionInput) {
    if (valid && validDateFormat) {
        handleTaskOverlayAfterSave(titleInput, descriptionInput);
    } else if (!validDateFormat && document.getElementById('due-date').value !== "") {
        throwError();
        document.getElementById('invalid-date').classList.remove('hidden');
    } else {
        throwError();
    }
}

/**
 * Handles the task overlay display and animation after a task is saved. 
 * It hides the overlay, resets certain elements, and highlights the newly created task.
 *
 * @function handleTaskOverlayAfterSave
 * @param {HTMLInputElement} titleInput - The input element containing the task title.
 * @param {HTMLInputElement} descriptionInput - The input element containing the task description.
 * @returns {void} This function does not return any value.
 * 
 * @description
 * This function performs the following steps after saving a task:
 * 1. Hides the error overlay and shows a task-added confirmation.
 * 2. Animates the "add-task" overlay fade-out effect.
 * 3. Initializes certain UI elements and clears selected contacts and subtasks.
 * 4. Finds and highlights the newly created task based on the title and description inputs.
 */
function handleTaskOverlayAfterSave(titleInput, descriptionInput) {
    saveTaskOverlay();
    document.getElementById('overlay-task-added').classList.remove('d-none');
    setTimeout(() => {
        document.getElementById("add-task__overlay").classList.add("fade-out");
        init();
        clearSelectedContactsAndSubtasks();
        setTimeout(() => {
            findAndHighlightNewlyCreatedTask(titleInput, descriptionInput);
        }, 500);
    }, 900);
}

/**
 * Saves the category of the button that was clicked.
 * 
 * This function is triggered by a click event on a button, and it extracts the value of the `data-category` attribute
 * from the clicked button and saves it to the `categoryFromClickedButton` variable. This allows the program to remember
 * the category associated with the clicked button for further use.
 * 
 * @function saveCategoryFromClickedButton
 * @param {Event} event - The event object representing the click event on the button.
 * @returns {void} - No value is returned, but the category is stored in the global variable `categoryFromClickedButton`.
 */
function saveCategoryFromClickedButton(event) {
    categoryFromClickedButton = event.currentTarget.getAttribute("data-category");
}

/**
 * Collects task data from the task overlay input fields and prepares the task object.
 * 
 * If no category is selected (`categoryFromClickedButton` is falsy), the function returns early.
 * Otherwise, it assigns all relevant task properties from user input and global variables.
 * The function finishes by delegating additional property setup to `buildTaskFromOverlayInputs()`.
 */
function saveTaskOverlay() {
    if (!categoryFromClickedButton) return;
    task.category = categoryFromClickedButton;
    task.taskType = document.getElementById('category').value;
    task.taskTitle = document.getElementById('title').value;
    task.taskDescription = document.getElementById('description').value;
    task.taskPriority = selectedPriority;
    task.numberOfSubtasks = subtasksCount;
    task.numberOfCompletedSubtasks = 0;
    task.subtasks = subtasks;
    task.taskDueDate = document.getElementById('due-date').value;
    task.assignedContacts = selectedContacts;
    buildTaskFromOverlayInputs();
}

/**
 * Saves the prepared task object to Firebase and resets the task variable.
 * 
 * This function assumes that the global `task` object has already been populated
 * with all necessary fields. After saving, it clears the `task` object to prepare
 * for potential future use.
 */
function buildTaskFromOverlayInputs() {
    saveToFirebase("tasks/", task);
    task = {};
}

/**
 * Fades out the overlay of the big task card and hides it after the animation.
 * This function adds a "fade-out" class to the big task card overlay, and after a short delay, removes the class
 * and toggles the visibility of the overlay by adding/removing the "d-none" class.
 * 
 * @returns {void} This function does not return any value. It modifies the DOM by adding/removing CSS classes
 * and toggling the visibility of the big task card overlay.
 */
function fadeOutBigTaskCard() {
    document.getElementById("big-task-card__overlay").classList.add("fade-out");
    setTimeout(() => {
        document.getElementById("big-task-card__overlay").classList.remove("fade-out");
        document.getElementById('big-task-card__overlay').classList.toggle('d-none');
    }, "120");
}

/**
 * Clears the selected contacts and subtasks by resetting the arrays.
 * This function empties the `selectedContacts` and `subtasks` arrays, effectively clearing any selections
 * of contacts and subtasks made by the user.
 * 
 * @returns {void} This function does not return any value. It modifies the `selectedContacts` and `subtasks` arrays.
 */
function clearSelectedContactsAndSubtasks() {
    selectedContacts.length = 0;
    subtasks.length = 0;
}

/**
 * Removes the "taskCategory" item from the sessionStorage.
 * This function deletes the "taskCategory" value stored in the sessionStorage, 
 * effectively removing any stored information about the task's category for the current session.
 * 
 * @returns {void} This function does not return any value. It modifies the sessionStorage.
 */
function removeSessionStorageTaskCategory() {
    sessionStorage.removeItem("taskCategory");
}

/**
 * Sets the "taskCategory" item in the sessionStorage.
 * This function stores the provided category as the "taskCategory" in the sessionStorage,
 * allowing the category information to persist for the duration of the session.
 * 
 * @param {string} category - The category to be stored in the sessionStorage as "taskCategory".
 * 
 * @returns {void} This function does not return any value. It modifies the sessionStorage.
 */
function setSessionStorageTaskCategory(category) {
    sessionStorage.setItem("taskCategory", category);
}

/**
 * Adds an event listener to the window that triggers the `setHeightForDragFields` function whenever the window is resized.
 * This function ensures that the height of the drag fields is adjusted accordingly when the window size changes.
 *
 * @returns {void} This function does not return any value.
 */
window.addEventListener("resize", setHeightForDragFields);