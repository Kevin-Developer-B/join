const BASE_URL_ADDTASK = "https://join-guast-account-default-rtdb.europe-west1.firebasedatabase.app/users/";

let userId;

let contacts = [];

let selectedContacts = [];

let selectedPriority = "medium";

let subtasksCount = 0;

let subtasks = [];

let task = {};

let unvalidInputs = [];

/**
 * Initializes different functions on page load
 */
async function initialize() {
    let contactsObj = await getContacts();
    await loadContactInfo(contactsObj);
    loadSmallInitials();
}

initialize();

/**
 * Selects or deselects the clicked button
 * @param {String} prio - name of the selected priority button
 */
function selectPrioButton(prio) {
    let button = document.getElementById(`${prio}`);
    let svg = document.getElementById(`svg-${prio}`);
    if (button.classList.contains(`${prio}`)) {
        toggleButtonClasses(true, button, svg, prio);
        selectedPriority = "";
    } else {
        clearPrioButtons();
        toggleButtonClasses(false, button, svg, prio);
        selectedPriority = prio;
    }
}

/**
 * Toggles different classes on clicked button and svg
 * @param {Boolean} boolean - boolean to define whether the classes should be added (true) or removed (false)
 * @param {HTMLElement} button - button element whose classes should be change
 * @param {HTMLElement} svg - svg element whose classes should be changed
 * @param {String} prio - name of the selected priority
 */
function toggleButtonClasses(boolean, button, svg, prio) {
    if (boolean) {
        button.classList.remove(`${prio}`);
        button.classList.remove('white');
        button.classList.add('button-prio-hover');
        svg.classList.remove('filter-white');
    } else {
        button.classList.add(`${prio}`);
        button.classList.add('white');
        button.classList.remove('button-prio-hover');
        svg.classList.add('filter-white');
    }
}

/**
 * Removes all classes from priority buttons to restore default state
 */
function clearPrioButtons() {
    let prios = ["urgent", "medium", "low"];
    for (let i = 0; i < prios.length; i++) {
        let button = document.getElementById(`${prios[i]}`);
        let svg = document.getElementById(`svg-${prios[i]}`);
        button.classList.remove(`${prios[i]}`);
        button.classList.remove('white');
        button.classList.add('button-prio-hover');
        svg.classList.remove('filter-white');
    }
}

/**
 * Selects default (medium) priority button
 */
function selectDefaultPrioButton() {
    let button = document.getElementById('medium');
    let svg = document.getElementById('svg-medium');
    button.classList.add('medium');
    button.classList.add('white');
    button.classList.remove('button-prio-hover');
    svg.classList.add('filter-white');
}

/**
 * Prevents the default behavior of the given event
 * @param {Event} event - event object whose default action should be prevented
 */
function preventDefault(event) {
    event.preventDefault();
}

/**
 * Stops the propagation of the given event, preventing it from bubbling up the DOM tree
 * @param {Event} event - event object whose propagation should be stopped
 */
function stopPropagation(event) {
    event.stopPropagation();
}

/**
 * Clears all inputs, removes thrown error messages and resets variables to their default values
 */
function clearInputs() {
    removeError();
    subtasksCount = 0;
    ['container-subtasks', 'container-assigned-contacts'].forEach(id => document.getElementById(id).innerHTML = "");
    clearPrioButtons();
    selectDefaultPrioButton();
    clearInputValues();
    document.getElementById('category').value = "";
    selectedContacts = [];
    renderAssignOptions(contacts);
    document.getElementById('max-char-title').classList.add('d-none');
    document.getElementById('invalid-date').classList.add('hidden');
    document.getElementById('container-input-subtask').classList.remove('input-unvalid');
}

/**
 * Clears the values of all inputs defined in the array
 */
function clearInputValues() {
    let inputs = ["title", "description", "due-date", "subtasks"];
    for (let i = 0; i <inputs.length; i++) {
        document.getElementById(`${inputs[i]}`).value = "";
    }
}

/**
 * Creates task by validating all inputs and saving the task if all inputs are valid or throwing errors if inputs are unvalid
 */
function createTask() {
    removeError();
    let valid = validateInputs();
    let validDateFormat = testDate();
    if (valid && validDateFormat) {
        saveTask();
        document.getElementById('overlay-task-added').classList.remove('d-none');
        setTimeout(() => {window.location.href = 'board.html';}, "900");
    } else if (!validDateFormat && document.getElementById('due-date').value !== "") {
        throwError();
        document.getElementById('invalid-date').classList.remove('hidden');
    } else throwError();
}

/**
 * Validates a set of required form inputs and adds unvalid inputs to the unvalidInput array
 * @returns true if all inputs are valid, otherwise false
 */
function validateInputs() {
    let valid = true;
    let inputs = ["title", "due-date", "category"];
    unvalidInputs = [];
    for (let i = 0; i < inputs.length; i++) {
        let inputValue = document.getElementById(`${inputs[i]}`).value;
        inputValue = inputValue.trim();
        if (inputValue == "" || ((inputs[i] == "due-date") && !testDate())) {
            valid = false;
            unvalidInputs.push(inputs[i]);
        }
    }
    return valid;
}

/**
 * Tests date input value to match a specific format order and to be in the future
 * @returns true if input value is valid or in the past, otherwise false
 */
function testDate() {
    let value = document.getElementById('due-date').value;
    let date = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (date === null) return false;
    let day = +date[1], month = +date[2], year = +date[3];
    let dateObj = new Date(year, month - 1, day);
    if (!correctDateFormat(dateObj, day, month, year)) {
        return false;
    } else if (isPastDate(dateObj)) {
        document.getElementById('invalid-date').innerText = "Due date can`t be in the past!";
        return false;
    }
    return true;
}

/**
 * Checks if a given Date object matches the specified day, month, and year
 * @param {Object} dateObj - date object to validate
 * @param {Number} day - the expected day
 * @param {Number} month - the expected month
 * @param {Number} year - the expected year
 * @returns false if the given date object is in the wrong format, otherwise true
 */
function correctDateFormat(dateObj, day, month, year) {
    let validDate = dateObj.getFullYear() === year &&
                    (dateObj.getMonth() + 1) === month &&
                    dateObj.getDate() === day;
    if (!validDate) {
        return false;
    }
    return true;
}

/**
 * Checks if the given date is in the past (before today).
 * The time portion of both dates is ignored by resetting it to 00:00:00.
 *
 * @param {Date} dateObj - The date to check.
 * @returns {boolean} True if the date is before today, otherwise false.
 */
function isPastDate(dateObj) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    if (dateObj < today) {
        return true;
    }
    return false;
}

/**
 * Throws error by removing classes from elements in the unvalidInputs array to show error messages
 */
function throwError() {
    unvalidInputs.forEach(element => {
        document.getElementById(`required-${element}`).classList.remove('hidden');
        if (element == "category" || element == "due-date") {
            document.getElementById(`container-input-${element}`).classList.add('input-unvalid')
        } else {
            document.getElementById(`${element}`).classList.add('input-unvalid');
        };
    });
}

/**
 * Removes error messages by adding classes to elements in the unvalidInputs array to hide error messages
 */
function removeError() {
    unvalidInputs.forEach(element => {
        document.getElementById(`required-${element}`).classList.add('hidden');
        if (element == "category" || element == "due-date") {
            document.getElementById(`container-input-${element}`).classList.remove('input-unvalid')
        } else {
            document.getElementById(`${element}`).classList.remove('input-unvalid');
        };
    });
    document.getElementById('invalid-date').classList.add('hidden');
    document.getElementById('invalid-subtask').classList.add('d-none');
}

/**
 * Saves task by setting key-value pairs of the task object
 */
function saveTask() {
    task.category = setTaskCategory();
    task.taskType = document.getElementById('category').value;
    task.taskTitle = document.getElementById('title').value;
    task.taskDescription = document.getElementById('description').value;
    task.taskPriority = selectedPriority;
    task.numberOfSubtasks = subtasksCount;
    task.numberOfCompletedSubtasks = 0;
    task.subtasks = subtasks;
    task.taskDueDate = document.getElementById('due-date').value;
    task.assignedContacts = selectedContacts;
    saveToFirebase("tasks/", task);
    task = {};
}

/**
 * Determines the task category based on the current window width
 * @returns the determined task category
 */
function setTaskCategory() {
    let category;
    if(window.innerWidth <= 1040) {
        category = getTaskCategory();
    } else {
        category = "toDos";
    }
    return category;
}

/**
 * Gets the tasks category by reading it from the session storage
 * @returns the tasks category read from the session storage
 */
function getTaskCategory() {
    if (sessionStorage.getItem("taskCategory") === "toDo" || sessionStorage.getItem("taskCategory") == null) {
        return "toDos";
    } else {
        return sessionStorage.getItem("taskCategory");
    }
}

/**
 * Saves the task object to a specified path of a firebase database
 * @param {String} path - path of the location where the task is saved
 * @param {Object} task - task object which is saved
 */
async function saveToFirebase(path, task) {
    if (userId == "guest") {
        path = "guest/" + path;
        await postData(path, task);
    } else {
        path = `${userId}/` + path;
        await postData(path, task)
    }
}

/**
 * Sends a POST request with JSON data to a specified endpoint
 * @param {String} path - path of the location where the task is saved
 * @param {Object} data - data object which is sent to the database
 * @returns a promise that resolves to the Fetch API Response object
 */
async function postData(path="", data={}) {
    let response = await fetch(BASE_URL_ADDTASK + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return response;
}

/**
 * Retrieves contact data from an endpoint based on the current user's ID
 * @param {*} path - path of the location where the contact data is retrieved from
 * @returns a promise that resolves to the parsed JSON response containing the contact data
 */
async function getContacts(path="") {
    userId = localStorage.getItem('userId');
    if (userId !== "guest") {
        path = userId;
        let response = await fetch(BASE_URL_ADDTASK + path + ".json");
        let responseJson = await response.json();
        return responseJson;
    } else {
        path = "guest";
        let response = await fetch(BASE_URL_ADDTASK + path + ".json");
        let responseJson = await response.json();
        return responseJson;
    }
}

/**
 * Loads and displays the user's initials in the specified element
 * @returns a window.location object
 */
async function loadSmallInitials() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        return window.location.href = "index.html?";
    }
    let dataPath = userId === "guest" ? "guest.json" : `${userId}.json`;
    let response = await fetch(BASE_URL_ADDTASK + dataPath);
    let userData = await response.json();
    document.getElementById('smallInitials').innerText = getInitials(userData.userDatas.name) || "G";
}

/**
 * Checks the length of the given inputField and shows an errorElement when the input is too long
 * @param {String} inputField - name of the input whose values length is checked
 */
function checkInputLength(inputField) {
    let input = document.getElementById(`${inputField}`);
    let errorElement = document.getElementById(`max-char-${inputField}`);
    let inputSettings = {"title": {invalidElement: null}, "subtasks": {invalidElement: "invalid-subtask"}};
    let maxLength = 50;
    let invalidElement = inputSettings[inputField].invalidElement;
    if (input.value.length == maxLength) {
        errorElement.classList.remove('d-none');
        if (invalidElement) document.getElementById(invalidElement).classList.add('d-none');
    } else {
        errorElement.classList.add('d-none');
    }
}

/**
 * Displays the value of the date picker as the inputs value
 */
function putDateToInput() {
    let datePicker = document.getElementById('date-picker');
    let input = document.getElementById('due-date');
    if (datePicker.value) {
        let [year, month, day] = datePicker.value.split('-');
        input.value = `${day}/${month}/${year}`;
    }
}