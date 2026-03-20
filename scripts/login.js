const BASE_URL = "https://join-guast-account-default-rtdb.europe-west1.firebasedatabase.app/"
let isPasswordVisible = false;
let logoAnimation = sessionStorage.getItem("moveAnimation");
const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get('msg');

/**
 * Displays a message in a modal for 2 seconds.
 * @param {string} msg - The message to display.
 */
if (msg) {
    const msgBox = document.getElementById('msgBox');
    const msgText = document.getElementById('msgText');
    msgText.innerHTML = msg;
    msgBox.classList.add('show');
    history.replaceState(null, "", window.location.pathname);
    setTimeout(() => {
        msgBox.classList.remove('show');
    }, 2000);
}

/**
 * Handles user login by validating email and password.
 */
async function userLogin() {
    let emailInput = document.getElementById('email');
    let passwordInput = document.getElementById('password');
    let email = emailInput.value;
    let password = passwordInput.value;
    let usersResponse = await fetch(BASE_URL + "users.json");
    let users = await usersResponse.json();
    let userId = Object.keys(users).find(key => users[key].userDatas.email === email && users[key].userDatas.password === password);
    handleUserLogin(userId, users, emailInput, passwordInput);
}

/**
 * Handles user login by storing user info and redirecting, or showing an error if login fails.
 * @param {string} userId - The user's ID.
 * @param {object} users - Object containing all users.
 * @param {HTMLElement} emailInput - The email input element.
 * @param {HTMLElement} passwordInput - The password input element.
 */
function handleUserLogin(userId, users, emailInput, passwordInput) {
    if (userId) {
        localStorage.setItem("userId", userId);
        sessionStorage.setItem("loggedIn", "true");
        window.location.href = 'html/summary.html?';
    } else {
        throwLoginDataError(users, emailInput, passwordInput);
    }
}

/**
 * Displays an error border and message on the corresponding input if the input value doesnt match the server`s data
 * @param {object} users - Object containing all users.
 * @param {HTMLElement} emailInput - Input element where the user enters his email address
 * @param {HTMLElement} passwordInput - Input element where the user enters his password
 */
function throwLoginDataError(users, emailInput, passwordInput) {
    const email = emailInput.value, password = passwordInput.value;
    const user = Object.values(users).find(u => u.userDatas.email === email);
    const emailValid = !!user, passwordValid = user?.userDatas.password === password;
    setInputBorder(emailInput, emailValid);
    setInputBorder(passwordInput, emailValid && passwordValid);
    toggleErrorMessage(!(emailValid && passwordValid));
}

/**
 * Validates the email input by checking against users from the database.
 */
async function validateEmailLoginInputs() {
    let usersResponse = await fetch(BASE_URL + "users.json");
    let users = await usersResponse.json();
    let emailInput = document.getElementById('email');
    const email = emailInput.value
    const user = Object.values(users).find(u => u.userDatas.email === email);
    const emailValid = !!user
    setInputBorder(emailInput, emailValid);
    toggleErrorMessage(!(emailValid));
}

/**
 * Validates the password input against stored user data and updates UI feedback.
 */
async function validatePasswordLoginInputs() {
    let usersResponse = await fetch(BASE_URL + "users.json");
    let users = await usersResponse.json();
    let passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    const user = Object.values(users).find(u => u.userDatas.email === email);
    const passwordValid = user?.userDatas.password === password;
    setInputBorder(passwordInput);
    toggleErrorMessage(!(passwordValid));
}

/**
 * Sets the input border color based on validity: grey if valid, red if invalid.
 * @param {HTMLElement} input - The input element whose border will be updated.
 * @param {boolean} isValid - Determines if the input is valid (true = grey border, false = red border).
 */
function setInputBorder(input, isValid) {
    if (isValid) {
        input.classList.remove("input-error");
        input.classList.add("input-default");

    } else {
        input.classList.remove("input-default");
        input.classList.add("input-error");
    }
}

/**
 * Displays or removes an errror message, depending on the value of show (remove if false, show otherwise)
 * @param {boolean} show - boolean to determine whether the error message should be shown or not
 */
function toggleErrorMessage(show) {
    document.getElementById('notCorrectValue').style.display = show ? 'block' : 'none';
}

/**
 * Sets the user ID to "guest" and redirects to the summary page.
 */
function loginGuastAccount() {
    localStorage.setItem("userId", "guest");
    sessionStorage.setItem("loggedIn", "true");
    window.location.href = "html/summary.html?"
}

/**
 * Changes the password icon based on focus and visibility state.
 * @param {boolean} focused - Whether the input is focused.
 */
function changePasswordIcon(focused) {
    const icon = document.getElementById("passwordIcon");
    const passwordInput = document.getElementById("password");
    if (focused) {
        icon.src = isPasswordVisible
            ? "assets/img/visibility.png"
            : "assets/img/visibility_off.png";
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
        icon.src = "assets/img/lock.png";
    } else if (isPasswordVisible) {
        icon.src = "assets/img/visibility.png";
    } else if (!isEmpty) {
        icon.src = "assets/img/visibility_off.png";
    } else {
        icon.src = "assets/img/lock.png";
    }
}

/**
 * Toggles password visibility and changes the icon.
 */
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    isPasswordVisible = !isPasswordVisible;
    if (isPasswordVisible) {
        input.type = "text";
        icon.src = "assets/img/visibility.png";
    } else {
        input.type = "password";
        icon.src = "assets/img/visibility_off.png";
    }
}

/**
 * Reloads the page and hides the login overlay and logo.
 */
function backLogin() {
    window.location.reload = "index.html"
    let overlay = document.getElementById('loginOverlay');
    overlay.style.display = "none"
    let loginLogo = document.getElementById('loginLogo');
    loginLogo.style.display = "none"
}

/**
 * Toggles the logo animation and updates the logo and overlay elements.
 * If animation is disabled, calls backLogin function.
 */
function animationLogo() {
    if (logoAnimation === "false") return backLogin();
    const { passivLogo, loginLogo, overlay, logoPath1, logoPath2, logoPath3, logoPath4, logoPath5 } = getLogoElements();
    updateLogoElements(passivLogo, loginLogo, overlay, [logoPath1, logoPath2, logoPath3, logoPath4, logoPath5]);
    setTimeout(() => {
        overlay.classList.remove('login-overlay');
        passivLogo.style.display = "flex";
        loginLogo.style.display = "none";
        resetLoginAnimation();
    }, 1000);
    sessionStorage.setItem("moveAnimation", "false");
}

/**
 * Updates the logo elements and triggers the animation.
 */
function updateLogoElements(passivLogo, loginLogo, overlay, logoPaths) {
    passivLogo.style.display = "none";
    loginLogo.style.display = "flex";
    overlay.classList.add('login-overlay');
    logoPaths.forEach(logoPath => logoPath.classList.add('animation-change-logo-color'));
    setTimeout(() => {
        logoPaths.forEach(logoPath => logoPath.classList.remove('animation-change-logo-color'));
    }, 1000);
}

/**
 * Retrieves logo-related DOM elements.
 * @returns {Object} An object containing the logo elements.
 */
function getLogoElements() {
    return {
        passivLogo: document.getElementById('passivLogo'),
        loginLogo: document.getElementById('loginLogo'),
        overlay: document.getElementById('loginOverlay'),
        logoPath1: document.getElementById('moveLogo1'),
        logoPath2: document.getElementById('moveLogo2'),
        logoPath3: document.getElementById('moveLogo3'),
        logoPath4: document.getElementById('moveLogo4'),
        logoPath5: document.getElementById('moveLogo5')
    };
}

/**
 * Resets the login animation by removing animation-related classes
 * and restoring the logo's default transform and positioning styles.
 *
 * This function targets the login logo and overlay elements,
 * removes animation classes, and sets the logo back to its
 * centered and scaled default state.
 *
 * Elements affected:
 * - #loginLogo: The main logo element displayed on the login screen.
 * - #loginOverlay: The overlay element involved in the animation.
 */
function resetLoginAnimation() {
    const loginLogo = document.getElementById("loginLogo");
    const loginOverlay = document.getElementById("loginOverlay");
    loginLogo.classList.remove("animation-move-logo");
    loginOverlay.classList.remove("animation-move-overlay");
    loginLogo.style.transform = "translate(-50%, -50%) scale(1)";
    loginLogo.style.top = "50%";
    loginLogo.style.left = "50%";
}

/**
 * Initializes the login animation sequence once the window has fully loaded.
 *
 * This event listener waits for the entire page (including images, stylesheets, etc.)
 * to load, then adds animation classes to the login logo and overlay elements.
 * It also triggers the `animationLogo` function to begin any additional animations.
 *
 * Elements affected:
 * - #loginLogo: The logo element to be animated on page load.
 * - #loginOverlay: The overlay element that accompanies the logo animation.
 *
 * Functions triggered:
 * - animationLogo(): Handles any custom logic or animations after initial class-based animation starts.
 */
window.addEventListener('load', function () {
    document.getElementById("loginLogo").classList.add("animation-move-logo");
    document.getElementById("loginOverlay").classList.add("animation-move-overlay");
    animationLogo();
})