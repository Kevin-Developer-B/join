const BASE_URL = "https://join-guast-account-default-rtdb.europe-west1.firebasedatabase.app/"
let allContacts = [];
let contactNames = [];
let bgColors = [];

/**
 * Initializes the application by loading necessary data.
 */
async function init() {
    await loadSmallInitials();
    await loadAllUserContacts();
    await allUserContacts();
    await loadColors();
    await loadContactList();
}

/**
 * Loads and displays user initials.
 */
async function loadSmallInitials() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        console.error("No logged in user found!");
        return window.location.href = "index.html?";
    }
    let dataPath = userId === "guest" ? "users/guest.json" : `users/${userId}.json`;
    let response = await fetch(BASE_URL + dataPath);
    let userData = await response.json();
    document.getElementById('smallInitials').innerText = findInitials(userData.userDatas.name) || "G";
}

/**
 * Loads user contacts.
 * 
 * @param {string} path - The user path.
 */
async function loadAllUserContacts(path) {
    let response = await fetch(`${BASE_URL}users/${path}.json`)
    return responseToJson = await response.json();
}

/**
 * Loads background colors from a CSS file.
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
 * Loads all user contacts and stores them in allContacts.
 */
async function allUserContacts() {
    let userId = localStorage.getItem("userId");
    let contactResponse = await loadAllUserContacts(`${userId}/allContacts`);
    if (!contactResponse) { 
        console.error("Fehler: contactResponse ist null oder undefined!");
        return;
    }
    fillAllContacts(contactResponse);
}

/**
 * Fills the allContacts array with contact data.
 * 
 * @param {Object} contactResponse The response containing contact data.
 */
function fillAllContacts(contactResponse) {
    let contactKeysArray = Object.keys(contactResponse);
    contactKeysArray.forEach(key => {
        allContacts.push({
            key,
            name: contactResponse[key]?.name,
            email: contactResponse[key]?.email,
            phone: contactResponse[key]?.phone,
            color: contactResponse[key]?.color,
        });
    });
}

/**
 * Highlights and scrolls to the new contact.
 * 
 * @param {Object} contact - The contact object.
 */
function highlightNewContact(contact) {
    setTimeout(() => {
        let newContactElement = [...document.querySelectorAll('.container-contact')]
            .find(el => el.textContent.includes(contact.name));
        if (newContactElement) {
            selectContact(newContactElement);
            newContactElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, 100);
}

/**
 * Sends data to the specified path.
 * 
 * @param {string} path - The API endpoint.
 * @param {Object} data - The data to send.
 */
async function sendData(path, data) {
    let response = await fetch(`${BASE_URL}users/${path}.json`,{
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
 * Hides the contact overlay and briefly shows a success message.
 */
function successfullyContact() {
    let newContactOverlay = document.querySelector('.new-contact-overlay');
    let newContactContainer = document.querySelector('.new-Contect-Container');
    let procressButton = document.querySelector('.add-new-button');
    newContactOverlay.classList.remove('active');
    newContactContainer.classList.remove('active');
    procressButton.style.backgroundColor = '#2A3647';
    setTimeout(() => {
        let messageBox = document.getElementById('succesfully-message-box');
        messageBox.style.display = "flex";
        setTimeout(() => {messageBox.style.display = "none";}, 2000);
    }, 500);
}

/**
 * Loads and sorts the contact list.
 */
async function loadContactList() {
    let contactList = document.getElementById('contactList');
    contactList.innerHTML = "";
    allContacts.sort((a, b) => a.name.localeCompare(b.name));
    let currentLetter = "";

    for (let i = 0; i < allContacts.length; i++) {
        currentLetter = await createContactGroup(allContacts[i], currentLetter, contactList);
    }
}

/**
 * Creates a contact group by first letter.
 * 
 * @param {Object} contact - The contact object.
 * @param {string} currentLetter - The current letter.
 * @param {Array} contactList - The contact list.
 */
async function createContactGroup(contact, currentLetter, contactList) {
    let firstLetter = contact.name.charAt(0).toUpperCase();
    if (currentLetter !== firstLetter) {
        currentLetter = firstLetter;
        addGroupHeader(contactList, currentLetter);
    }
    await addContactToGroup(contact, currentLetter);
    return currentLetter;
}

/**
 * Adds a group header to the contact list.
 * 
 * @param {HTMLElement} contactList - The contact list container.
 * @param {string} letter - The letter for the group header.
 */
function addGroupHeader(contactList, letter) {
    contactList.innerHTML += `<div>
        <div class="container-letter">${letter}</div>
        <div id="group-${letter}"></div>
    </div>`;
}

/**
 * Adds a contact to the corresponding group.
 * 
 * @param {Object} contact - The contact object.
 * @param {string} letter - The group identifier.
 */
async function addContactToGroup(contact, letter) {
    let groupContainer = document.getElementById(`group-${letter}`);
    let isFirst = groupContainer.children.length === 0;
    groupContainer.innerHTML += `${isFirst ? "<hr class='line'>" : ""}${await getContactListTemplate(contact.name, contact.email, contact.color)}`;
    document.getElementById(contact.name).innerText = contact.name;
    document.getElementById(`doppelInitials-${contact.name}`).innerText = findInitials(contact.name);
}

/**
 * Gets initials from a name.
 * 
 * @param {string} contactName - The full name.
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
 * Toggles contact selection.
 * 
 * @param {HTMLElement} element - Clicked contact element.
 */
function selectContact(element) {
    let isSelected = element.classList.contains('select-contact');
    let moreInfoContainer = document.getElementById('moreInformationContact');
    let overlay = document.querySelector('.more-information-container');
    let newContactButtonColor = document.querySelector('.add-new-button')
    document.querySelectorAll('.container-contact').forEach(contact => {
        contact.classList.remove('select-contact');
        contact.style.color = "black";
    });
    newContactButtonColor.classList.remove('active')
    toggleContactSelection(isSelected, element, moreInfoContainer, overlay);
}

/**
 * Toggles the selection state of the contact and updates UI elements.
 * 
 * @param {boolean} isSelected - Whether the contact is currently selected.
 * @param {HTMLElement} element - The clicked contact element.
 * @param {HTMLElement} moreInfoContainer - The container for more information.
 * @param {HTMLElement} overlay - The overlay for mobile view.
 */
function toggleContactSelection(isSelected, element, moreInfoContainer, overlay) {
    if (isSelected) {
        moreInfoContainer.style.transform = 'translateX(100%)';
        setTimeout(() => moreInfoContainer.innerHTML = '', 500);
        closeContactMobilButton();
    } else {
        element.classList.add('select-contact');
        element.style.color = "white";
        moreContactInformation(element.querySelector('.contact-preview-name').id);
        if (window.innerWidth <= 1040) {
            overlay.classList.add('mobile-overlay');
        }
    }
}

/**
 * Closes mobile contact overlay and resets contact styles.
 */
function closeContactMobilButton() {
    document.querySelector('.more-information-container').classList.remove('mobile-overlay');
    document.querySelectorAll('.container-contact').forEach(contact => {
        contact.classList.remove('select-contact');
        contact.style.color = "black";
    });
}

/**
 * Updates and displays more contact information.
 * 
 * @param {string} contactName - The name of the contact.
 */
async function moreContactInformation(contactName) {
    document.getElementById(`${contactName}`).innerText = contactName;
    let initials = findInitials(contactName);
    document.getElementById(`doppelInitials-${contactName}`).innerText = initials;
    let contact = allContacts.find(c => c.name === contactName);
    if (contact) {
        let contactDetailsTemplate = await selectMoreContactInformationTemplate(contact, initials);
        let contactInfoContainer = document.getElementById('moreInformationContact');
        contactInfoContainer.innerHTML = contactDetailsTemplate;
        animateContactInfo(contactInfoContainer);
    }
}

/**
 * Animates the contact info container based on the window width.
 * 
 * @param {HTMLElement} contactInfoContainer - The container element of the contact information.
 */
function animateContactInfo(contactInfoContainer) {
    if (window.innerWidth >= 1040) {
        contactInfoContainer.style.transition = 'transform 0.5s ease-out';
        setTimeout(() => {
            contactInfoContainer.style.transform = 'translateX(0)';
        }, 10);
    } else {
        contactInfoContainer.style.transition = 'none';
        setTimeout(() => {
            contactInfoContainer.style.transform = 'none';
        }, 10);
    }
}

/**
 * Updates a contact template in the DOM with new information.
 * 
 * @param {string} contactKey - The unique identifier for the contact.
 * @param {Object} updatedContact - The updated contact information.
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 */
async function updateContactTemplate(contactKey, updatedContact) {
    let contactElement = document.querySelector(`#contact-${contactKey}`);
    if (contactElement) {
        let contact = allContacts.find(c => c.key === contactKey);
        let initials = findInitials(updatedContact.name);
        let template = await selectMoreContactInformationTemplate(contact, initials);
        let newElement = document.createElement("div");
        newElement.id = `contact-${contactKey}`;
        newElement.innerHTML = template;
        contactElement.replaceWith(newElement);
    }
    if (contactElement) resetUiElements();
}

/**
 * Resets UI elements by updating their class lists.
 * Hides processing overlay, enables menu and support boxes, and deactivates the process button after a delay.
 */
function resetUiElements() {
    let procressOverlay = document.querySelector('.mobile-procressing-area-overlay');
    let menuBox = document.querySelector('.menu-box');
    let supportBox = document.querySelector('.small-menu-button');
    let procressButton = document.querySelector('.mobile-procressing-area-button');
    procressOverlay.classList.add('close');
    procressOverlay.classList.remove('active');
    menuBox.classList.remove('inactive');
    supportBox.classList.remove('inactive');
    setTimeout(() => {
        procressButton.classList.remove('active');
    }, 1000);
}

/**
 * Deletes a contact from the user's contact list based on the given key.
 * Displays a success message and updates the UI after deletion.
 *
 * @param {string} key - The unique identifier of the contact to be deleted.
 * @returns {Promise<void>} - A promise that resolves when the contact is deleted and the UI is updated.
 */
async function deleteContact(key) {
    if (!key) return;
    let userId = localStorage.getItem("userId");
    let response;
    try {
        response = await fetch(`${BASE_URL}/users/${userId}/allContacts/${key}.json`, { method: "DELETE" });
        showSuccessEditedMessage("Contact successfully deleted");
        resetUiElements();
        handlePostDeleteUIUpdate(key);
    } catch (error) {}
}

/**
 * Updates the UI after a contact is deleted.
 * 
 * @param {string} key - The key of the deleted contact.
 */
function handlePostDeleteUIUpdate(key) {
    allContacts = allContacts.filter(contact => contact.key !== key);
    loadContactList();
    document.querySelector('.edit-contact-overlay')?.classList.remove('active');
    document.getElementById('moreInformationContact').innerHTML = '';
    document.querySelector('.more-information-container')?.classList.remove('mobile-overlay');
    document.querySelector('.mobile-procressing-area-button').style.backgroundColor = '#2A3647';
    menuBox.classList.add('active');
    supportBox.classList.add('active');
}