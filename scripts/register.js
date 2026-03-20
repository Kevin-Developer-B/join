const BASE_URL = "https://join-guast-account-default-rtdb.europe-west1.firebasedatabase.app/"
let isPasswordVisible = false;
let isControllPasswordVisible = false;
let bgColors = [];

/**
 * Initializes the application by loading colors, user data, and setting up session storage.
 */
async function init() {
    await loadColors();
    await loadAllUserData();
}

/**
 * Loads background color classes from a CSS file and returns them as objects.
 * @returns {Promise<Array<{name: string, color: string}>>}
 */
async function loadColors() {
    let responseColors = await fetch("../styles/colors.css");
    let responseColorText = await responseColors.text();
    const regex = /\.bg-([\w-]+)\s*\{[^}]*background(?:-color)?:\s*([^;}]+)/g;
    let matches = [...responseColorText.matchAll(regex)];
    for (let i = 0; i < matches.length; i++) {
        bgColors.push({
            name: `.bg-${matches[i][1]}`,
            color: matches[i][2].trim()
        });
    }
    return bgColors;
}

/**
 * Loads and returns JSON user data from the given path.
 * @param {string} path - Relative path to the user data file (without ".json").
 * @returns {Promise<Object>} Parsed JSON data.
 */
async function loadAllUserData(path) {
    let response = await fetch(BASE_URL + path + ".json")
    return responseToJson = await response.json();
}

/**
 * Sends a POST request with JSON data to the specified path.
 * @param {string} path - API endpoint path.
 * @param {Object} data - Data to send in the request body.
 * @returns {Promise<Object>} - Parsed JSON response.
 */
async function sendData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    let responseToJson = await response.json();
    return responseToJson;
}

/**
 * Sends a PUT request with JSON data to the specified path.
 * @param {string} path - Endpoint path (without .json).
 * @param {Object} data - Data to send in the request body.
 * @returns {Promise<Object>} - Parsed JSON response.
 */
async function putData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    let responseToJson = await response.json();
    return responseToJson;
}

/**
 * Handles user registration: creates user, registers them, and redirects on success.
 * @param {Event} event - The form submit event.
 * @param {HTMLFormElement} form - The registration form element.
 */
async function addUserToRegister(event, form) {
    event.preventDefault();
    const color = await randomBgColor();
    if (!await UserRegister()) return false;
    const newUser = createUserObject(form, color);
    const userId = await registerUser(newUser);
    if (!userId) return false;
    clearForm(form);
    window.location.href = '../index.html?msg=You Signed Up successfully';
    return false;
}

/**
 * Returns a random background color class name.
 * @returns {string} The class name of a random background color.
 */
async function randomBgColor() {
    if (bgColors.length === 0) return ".bg-grey";
    let randomIndex = Math.floor(Math.random() * bgColors.length);
    return bgColors[randomIndex].name.replace(/^\./, '');
}

/**
 * Registers a user by sending data to an API and returns the user ID if successful.
 * @async
 * @param {Object} user - The user data to be registered.
 * @returns {string|null} The user ID if registration succeeds, otherwise null.
 */
async function registerUser(user) {
    const response = await sendData("/users", {});
    if (response?.name) {
        const userId = response.name;
        await putData(`/users/${userId}/userDatas`, user);
        await sendData(`/users/${userId}/allContacts`, user);
        return userId;
    } else {
        console.error("User registration failed.");
        return null;
    }
}

/**
 * Creates a user object from the form data and color.
 * @param {HTMLFormElement} form - The form containing user data.
 * @param {string} color - The user's color preference.
 * @returns {Object} The user object.
 */
function createUserObject(form, color) {
    return {
        name: form.querySelector('#name').value + " (You)",
        email: form.querySelector('#email').value,
        password: form.querySelector('#password').value,
        color: color,
        phone: " "
    };
}

/**
 * Clears the values of name, email, and password fields in the form.
 * @param {HTMLFormElement} form - The form to clear.
 */
function clearForm(form) {
    form.querySelector('#name').value = '';
    form.querySelector('#email').value = '';
    form.querySelector('#password').value = '';
}

/**
 * Redirects the user to the login page.
 */
function backToLogin() {
    window.location.href = '../index.html?';
}

/**
 * Validates user registration inputs (name, email, checkbox and passwords).
 * @returns {Promise<boolean>} True if all variables (name, email, checkbox and passwords) are valid, otherwise false.
 */
async function UserRegister() {
    const password = document.getElementById('password');
    const conrollPassword = document.getElementById('controllPassword');
    const checkbox = document.getElementById('checkbox');
    const checkboxValid = validateCheckbox(checkbox);
    const passwordMatch = validatePasswords(password, conrollPassword);
    const nameValid = validateSignupInputs('name');
    const emailValid = validateSignupInputs('email');
    const passwordValid = validateSignupInputs('password');
    return nameValid && emailValid && checkboxValid && passwordValid && passwordMatch;
}

/**
 * Validates if the specified input (name or email) is filled correctly and updates its border style accordingly.
 *
 * @param {string} input - The ID of the input element to validate.
 * @returns {boolean} Returns true if the input is valid, otherwise false.
 */
function validateSignupInputs(input) {
    const inputRef = document.getElementById(`${input}`);
    let inputRefValue = inputRef.value.trim();
    let isValid = true;
    if (inputRefValue.length == 0 || (input == "email" && !inputRefValue.includes("@"))) {
        inputRef.classList.remove("input-default");
        inputRef.classList.add("input-error");
        if (input !== "password") throwErrorMessage(input);
        if (input == "email" && inputRefValue.length !== 0 && !inputRefValue.includes("@")) updateErrorMesssage();
        isValid = false;
    } else resetInputStyleAndError(inputRef, input);
    return isValid;
}

/**
 * Resets the input element’s style to default and hides the associated error message (if applicable).
 *
 * @param {HTMLElement} inputRef - The input element to reset styles for.
 * @param {string} input - The name/ID of the input, used to identify the related error message element.
 * @returns {void}
 */
function resetInputStyleAndError(inputRef, input) {
    inputRef.classList.remove("input-error");
    inputRef.classList.add("input-default");
    if (input !== "password") {
        document.getElementById(`error-message-${input}`).style.display = 'none';
    }
}

/**
 * Shows a error message by changing styles and removing classes
 * @param {*} input - name of the input whose error message should be displayed
 */
function throwErrorMessage(input) {
    document.getElementById(`error-message-${input}`).style.display = 'flex';
    document.getElementById(`error-message-${input}`).innerText = 'This field is required!';
    document.getElementById('error-message-email').classList.remove('error-massage-medium');
}

/**
 * Updates the error message for the email input
 */
function updateErrorMesssage() {
    document.getElementById('error-message-email').innerText = 'Unvalid format (example@domain.de)!';
    document.getElementById('error-message-email').classList.add('error-massage-medium');
}

/**
 * Validates if a checkbox is checked and updates its border color.
 * @param {HTMLInputElement} checkbox - The checkbox element to validate.
 * @returns {boolean} True if checked, false otherwise.
 */
function validateCheckbox(checkbox) {
    const isValid = checkbox.checked;
    checkbox.style.border = `2px solid ${isValid ? 'black' : 'red'}`;
    return isValid;
}

/**
 * Validates whether the provided passwords match and updates the UI accordingly.
 *
 * @param {HTMLInputElement} password - The password input element.
 * @param {HTMLInputElement} confirmPassword - The confirmation password input element.
 * @returns {boolean} True if the passwords match and are not empty; otherwise, false.
 */
function validatePasswords(password, conrollPassword) {
    let passwordValue = password.value.trim();
    let conrollPasswordValue = conrollPassword.value.trim();
    const match = passwordValue !== "" && passwordValue === conrollPasswordValue;
    conrollPassword.classList.toggle("input-error", !match);
    conrollPassword.classList.toggle("input-default", match);
    document.getElementById('notCorrectValue').style.display = match ? 'none' : 'flex';
    return match;
}

/**
 * Updates the password icon based on input focus and visibility state.
 * @param focused - Whether the password input is focused.
 */
function changePasswordIcon(focused) {
    const icon = document.getElementById("passwordIcon");
    const passwordInput = document.getElementById("password");
    if (focused) {
        icon.src = isPasswordVisible
            ? "../assets/img/visibility.png"
            : "../assets/img/visibility_off.png";
        return;
    }
    updatePasswordIconState(passwordInput, icon);
}

/**
 * Updates the password icon based on input state and visibility.
 * @param {HTMLInputElement} passwordInput - The password input field.
 * @param {HTMLImageElement} icon - The icon element to update.
 */
function updatePasswordIconState(passwordInput, icon) {
    const isEmpty = passwordInput.value.trim().length === 0;
    if (isPasswordVisible && isEmpty) {
        isPasswordVisible = false;
        passwordInput.type = "password";
        icon.src = "../assets/img/lock.png";
    } else if (isPasswordVisible) {
        icon.src = "../assets/img/visibility.png";
    } else if (!isEmpty) {
        icon.src = "../assets/img/visibility_off.png";
    } else {
        icon.src = "../assets/img/lock.png";
    }
}

/**
 * Toggles the visibility of the password input field.
 */
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    isPasswordVisible = !isPasswordVisible;
    if (isPasswordVisible) {
        input.type = "text";
        icon.src = "../assets/img/visibility.png";
    } else {
        input.type = "password";
        icon.src = "../assets/img/visibility_off.png";
    }
}

/**
 * Updates the password visibility icon based on input focus and value.
 * @param {boolean} focused - Indicates if the password input is focused.
 */
function changeConrollPasswordIcon(focused) {
    const icon = document.getElementById("passwordControllIcon");
    const passwordInput = document.getElementById("controllPassword");
    const isEmpty = passwordInput.value.trim().length === 0;
    if (focused) {
        icon.src = isControllPasswordVisible
            ? "../assets/img/visibility.png"
            : "../assets/img/visibility_off.png";
        return;
    }
    updateIconOnBlur(isEmpty, passwordInput, icon);
}

/**
 * Updates the icon based on input blur state and password visibility.
 * @param {boolean} isEmpty - Whether the input is empty.
 * @param {HTMLInputElement} passwordInput - The password input element.
 * @param {HTMLImageElement} icon - The icon element to update.
 */
function updateIconOnBlur(isEmpty, passwordInput, icon) {
    if (isControllPasswordVisible && isEmpty) {
        isControllPasswordVisible = false;
        passwordInput.type = "password";
        icon.src = "../assets/img/lock.png";
    } else if (isControllPasswordVisible) {
        icon.src = "../assets/img/visibility.png";
    } else if (!isEmpty) {
        icon.src = "../assets/img/visibility_off.png";
    } else {
        icon.src = "../assets/img/lock.png";
    }
}

/**
 * Toggles password visibility and updates the icon.
 * @param {string} inputId - ID of the password input element.
 * @param {string} iconId - ID of the icon element.
 */
function toggleControllPasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    isControllPasswordVisible = !isControllPasswordVisible;
    if (isControllPasswordVisible) {
        input.type = "text";
        icon.src = "../assets/img/visibility.png";
    } else {
        input.type = "password";
        icon.src = "../assets/img/visibility_off.png";
    }
}

/**
 * Hides login-related links based on login status and screen width.
 */
function hideLoggendInLinks() {
    const status = sessionStorage.getItem("loggedIn");
    if (status === null && window.innerWidth > 1040) {
        hideLoggedInLinksDesktop();
    } else if (status === null && window.innerWidth < 1040) {
        hideLoggedInLinksDesktop();
        document.getElementById('menu-button-bottom-box').style.display = "flex";
    }
    if (status === "true") {
        Array.from(document.getElementsByClassName('login'))
            .forEach(li => li.style.display = 'none');
    }
}

/**
 * Hides logged-in user links on window resize to ensure responsive layout behavior.
 */
window.addEventListener("resize", hideLoggendInLinks);

/**
 * Hides elements for logged-in users on desktop and updates the login button style.
 */
function hideLoggedInLinksDesktop() {
    const loggedInLinks = Array.from(document.getElementsByClassName('logged-in'));
    loggedInLinks.forEach(li => {
        li.style.display = 'none';
        document.getElementById('login-button').classList.add('menu-login-button');
    });
    const buttonBox = Array.from(document.getElementsByClassName('button-box'));
    buttonBox.forEach(box => {
        box.style.display = 'none';
    })
}