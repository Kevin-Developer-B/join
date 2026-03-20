const BASE_URL = "https://join-guast-account-default-rtdb.europe-west1.firebasedatabase.app/"
const priorities = ['urgent', 'medium', 'low'];
const priorityIcons = {
    urgent: '../assets/icons/urgent-summary.png',
    medium: '../assets/icons/medium-summary.svg',
    low: '../assets/icons/low-summary.svg',
};

/**
 * Initializes the application by loading user data.
 * 
 * This asynchronous function is used to initialize the application by calling the `loadUserData` function,
 * which fetches or loads user-related data. The `init` function is meant to be called at the start of the 
 * application to ensure that user data is loaded before the application runs.
 * 
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the user data has been loaded.
 * 
 * @example
 * init().then(() => {
 *     console.log('User data has been successfully loaded!');
 * });
 */
async function init() {
    await loadUserData()
}

/**
 * Loads user data from a JSON file based on the user ID stored in localStorage.
 * If the user is not logged in or the user ID is invalid, redirects to the login page.
 * 
 * Fetches the user data from the appropriate file (either `guest.json` or a user-specific JSON file) 
 * and updates the user name and initials on the page.
 * 
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the user data is successfully loaded and the UI is updated.
 * 
 * @throws {Error} If the user ID cannot be found in localStorage or the fetch request fails.
 * 
 * @example
 * await loadUserData();
 */
async function loadUserData() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        return window.location.href = "index.html?";
    }
    let dataPath = userId === "guest" ? "users/guest.json" : `users/${userId}.json`;
    let response = await fetch(BASE_URL + dataPath);
    let userData = await response.json();
    let userNameElement = document.getElementById('userName');
    let userName = userData.userDatas.name || "";
    updateUserNameAndInitials(userId, userData, userNameElement, userName);
}

/**
 * Extracts the initials from a contact name by taking the first letter of the first two words of the name.
 * 
 * This function trims the input name, splits it into words, and collects the first letter of each word 
 * (up to the first two words). The initials are returned as a string, with each letter capitalized.
 * 
 * @function
 * @param {string} contactName - The full name of the contact (e.g., "John Doe").
 * @returns {string} - A string containing the initials of the contact. If the name has fewer than two words, 
 *                     only the first letter of the first word is returned.
 * 
 * @example
 * const initials = findInitials("John Doe"); returns "JD"
 */
function findInitials(contactName) {
    let name = contactName.trim().split(' ').filter(n => n);
    let initials = '';
    for (let i = 0; i < Math.min(name.length, 2); i++) {
        initials += name[i].charAt(0).toUpperCase();
    }
    return initials
}

/**
 * Determines the current time of day and updates the greeting message for the user.
 * It assigns "Good morning", "Good day", or "Good evening" based on the current hour.
 * 
 * @function
 * @param {string} userId - The ID of the user to personalize the greeting.
 */
function currentTime(userId) {
    const currentTime = new Date().getHours();
    let greeting = "";
    if (currentTime < 12) {
        greeting = "Good morning";
    } else if (currentTime < 18) {
        greeting = "Good day";
    } else {
        greeting = "Good evening";
    }
    updateGreetingForUser(userId, greeting);
}

/**
 * Fetches and processes data from the database.
 * Retrieves user data from local storage, loads tasks, and updates task deadlines.
 * If an error occurs during the data loading process, it is logged to the console.
 * 
 * @async
 * @function
 * @throws {Error} If an error occurs while retrieving or processing the data, it is caught and logged.
 */
async function readFromDatabase() {
    try {
        let userKey = localStorage.getItem("userId");
        let allLoadTasks = [];
        loadNumberOfTasksinHtmlElements(allLoadTasks);
        loadNumberOfPriorityTasks(allLoadTasks);
        updateTaskDeadline(userKey, allLoadTasks);
    } catch (error) {
        console.error("error loading the data:", error);
    }
}

/**
 * Processes and loads user task data from the result of a fetch operation.
 * The data is parsed from the response and each task is processed to ensure
 * that assigned contacts are initialized. It then updates the task count and priority tasks.
 * 
 * @async
 * @function
 * @param {Response} result - The response object from the fetch request containing user task data.
 * @throws {Error} If an error occurs during the processing of the fetched task data.
 */
async function processAndLoadUserTasks(result, allLoadTasks) {
    let data = await result.json();
    if (data) {
        Object.entries(data).forEach(([firebaseKey, value]) => {
            value.id = firebaseKey;
            if (!value.assignedContacts) {
                value.assignedContacts = [];
            }
            allLoadTasks.push(value);
        });
        loadNumberOfTasksinHtmlElements(allLoadTasks);
        loadNumberOfPriorityTasks(allLoadTasks);
    }
}

/**
 * Loads the upcoming deadline for tasks of a given priority and separates their due dates
 * into past and future deadlines based on the current date.
 *
 * Filters out tasks with the category "done" and processes only those with the specified priority.
 * The deadlines are passed to a helper function to be sorted by date category.
 *
 * @param {Array<Object>} allLoadTasks - The list of all loaded tasks, each containing properties like `taskPriority`, `category`, and `taskDueDate`.
 * @param {string} priority - The task priority to filter for (e.g., "urgent", "medium", or "low").
 */
function loadUpcomingDeadline(allLoadTasks, priority) {
    let tasksWithCurrentPriority = allLoadTasks.filter(element => element.taskPriority === priority && element.category !== "done");
    let datesOfUpcomingDeadlines = tasksWithCurrentPriority.map(element => element.taskDueDate);
    const currentDate = new Date();
    let pastDeadlines = [];
    let futureDeadlines = [];
    splitDeadlinesByDate(datesOfUpcomingDeadlines, currentDate, pastDeadlines, futureDeadlines);
}

/**
 * Sorts a list of deadline date strings into past and future deadlines based on the current date.
 * 
 * Converts date strings in "dd/mm/yyyy" format to JavaScript Date objects.
 * Adds each date to either `pastDeadlines` or `futureDeadlines` depending on whether the date is
 * before or after the current date. Then calls `displayClosestPastDeadline()` to update the display.
 * 
 * @param {string[]} datesOfUpcomingDeadlines - Array of task due dates as strings in "dd/mm/yyyy" format.
 * @param {Date} currentDate - The reference date (usually today's date).
 * @param {Date[]} pastDeadlines - Array to collect deadline dates that are in the past.
 * @param {Date[]} futureDeadlines - Array to collect deadline dates that are in the future.
 */
function splitDeadlinesByDate(datesOfUpcomingDeadlines, currentDate, pastDeadlines, futureDeadlines) {
    if (datesOfUpcomingDeadlines) {
        for (let dateString of datesOfUpcomingDeadlines) {
            if (!dateString) continue;
            let taskDate = new Date(dateString.split("/").reverse().join("-"));
            if (taskDate < currentDate) {
                pastDeadlines.push(taskDate);
            } else {
                futureDeadlines.push(taskDate);
            }
        }
    }
    displayClosestPastDeadline(currentDate, pastDeadlines, futureDeadlines);
}