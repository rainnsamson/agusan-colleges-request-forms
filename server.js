// Import necessary functions from Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc, addDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "db-aci-request-forms.firebaseapp.com",
    projectId: "db-aci-request-forms",
    storageBucket: "db-aci-request-forms.appspot.com",
    messagingSenderId: "78560005691",
    appId: "1:78560005691:web:f2585b5914da48f1bcd61e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Flag for applying filter
let applyFilter = false;

// Function to authenticate user
async function authenticateUser(username, password) {
    try {
        const usersCollection = collection(db, "aci-registrar");
        const q = query(usersCollection, where("username", "==", username), where("password", "==", password));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.size > 0) {
            const user = querySnapshot.docs[0].data();
            const role = user.role;
            sessionStorage.setItem("role", role);
            return "forms.html";
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error authenticating user:", error);
        return false;
    }
}

// Event listener for login form submission
document.addEventListener("DOMContentLoaded", async function () {
    var loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            var username = document.getElementById("username").value;
            var password = document.getElementById("password").value;

            const redirectPage = await authenticateUser(username, password);

            if (redirectPage) {
                sessionStorage.setItem("username", username);
                window.location.href = redirectPage;
            } else {
                alert("Invalid username or password. Please try again.");
            }
        });
    }
});

// Event listener for logout button
document.addEventListener("DOMContentLoaded", function () {
    var usernameDisplay = document.getElementById("usernameDisplay");
    var logoutButton = document.getElementById("logout");

    if (usernameDisplay) {
        var username = sessionStorage.getItem("username");
        usernameDisplay.innerText = " " + username;
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function (event) {
            event.preventDefault();
            sessionStorage.removeItem("username");
            window.location.href = "index.html";
        });
    }
});

// Event listener for changes in filters
document.addEventListener("change", function(event) {
    if (event.target.id === "dateFilter" || event.target.id === "statusFilter" || event.target.id === "dateFilterIssued") {
        sessionStorage.setItem("currentPage", 1);
        displayRequests(1);
    }
});

// Display requests function with pagination
async function displayRequests(pageNumber) {
    const requestTableBody = document.getElementById("requestTableBody");
    const paginationContainer = document.getElementById("paginationContainer");
    const itemsPerPage = 25;
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = pageNumber * itemsPerPage;

    try {
        const dateFilter = document.getElementById("dateFilter").value;
        const dateFilterIssued = document.getElementById("dateFilterIssued").value;
        const statusFilter = document.getElementById("statusFilter").value;
        const queryRef = collection(db, "Request");

        const sortedQueryRef = query(queryRef, orderBy("dateRequested", "desc"));
        let filteredQueryRef = sortedQueryRef;

        if (dateFilter) {
            filteredQueryRef = query(sortedQueryRef, where("dateRequested", "==", dateFilter));
        }

        const querySnapshot = await getDocs(filteredQueryRef);

        requestTableBody.innerHTML = "";
        const userRole = sessionStorage.getItem("role");
        const statusColors = {
            "Pending": "pending-color",
            "Processing": "processing-color",
            "For Release": "for-release-color",
            "Received": "received-color"
        };
        const userOptions = ['jbermoy', 'nclaro', 'rbasanal', 'fodlime'];

        let itemCount = 0;

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const requestData = doc.data();
                if ((!dateFilterIssued || dateFilterIssued === requestData.dateIssued) &&
                    (statusFilter === "all" || statusFilter === requestData.status)) {
                    if (itemCount >= startIndex && itemCount < endIndex) {
                        // Generate table rows
                        const statusOptions = ['', 'Pending', 'Processing', 'For Release', 'Received'];
                        const statusDropdownOptions = statusOptions.map(option => {
                            const selected = option === requestData.status ? "selected" : "";
                            const colorClass = statusColors[option];
                            return `<option value="${option}" ${selected} class="${colorClass}">${option === '' ? 'Select Status' : option}</option>`;
                        }).join("");

                        const userDropdownOptions = userOptions.map(option => {
                            const selected = option === requestData.user ? "selected" : "";
                            return `<option value="${option}" ${selected}>${option}</option>`;
                        }).join("");

                        const defaultUserOption = `<option value="" ${requestData.user ? "" : "selected"} disabled>Select User</option>`;
                        const remarksValue = requestData.remarks ? requestData.remarks : "";
                        const dateIssuedValue = requestData.dateIssued ? requestData.dateIssued : "";
                        const dropdownStyle = "class='form-select status-dropdown' style='min-width: 150px;'";

                        let sendMailButton = "";
                        if (requestData.status === "For Release" && requestData.emailSent !== "Email Sent") {
                            sendMailButton = `<button class="btn btn-primary send-mail-btn" data-doc-id="${doc.id}">Send Mail</button>`;
                        } else {
                            sendMailButton = requestData.emailSent;
                        }

                        let actionColumn = "";
                        if (userRole === "head") {
                            actionColumn = `
                                <td>
                                    <button class="btn btn-secondary edit-btn" data-doc-id="${doc.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger delete-btn" data-doc-id="${doc.id}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            `;
                        } else {
                            actionColumn = `
                                <td class="table-cell"><button class="btn btn-secondary edit-btn" data-doc-id="${doc.id}">Edit</button></td>
                            `;
                        }

                        const tableRow = `
                            <tr>
                                <td class="table-cell">${itemCount + 1}</td>
                                <td>${requestData.idNumber}</td>
                                <td>${requestData.dateRequested}</td>
                                <td>
                                    <select id="status_${doc.id}" class="form-select status-update ${statusColors[requestData.status]}" data-doc-id="${doc.id}" ${dropdownStyle}>
                                        ${statusDropdownOptions}
                                    </select>
                                </td>
                                <td>
                                    <select id="user_${doc.id}" class="form-select user-update ${requestData.user ? "" : "no-user"}" data-doc-id="${doc.id}" ${dropdownStyle}>
                                        ${defaultUserOption}
                                        ${userDropdownOptions}
                                    </select>
                                </td>
                                <td>${requestData.surname}</td>
                                <td>${requestData.firstName}</td>
                                <td>${requestData.middleName}</td>
                                <td>${requestData.contactNumber}</td>
                                <td>${requestData.emailAddress}</td>
                                <td>${requestData.documentRequest}</td>
                                <td>${requestData.purpose}</td>
                                <td>${requestData.controlNumber}</td>
                                <td>${requestData.orNumber}</td>
                                <td>
                                    <input type="date" id="dateIssued_${doc.id}" name="dateIssued_${doc.id}" class="form-control date-issued" data-doc-id="${doc.id}" value="${dateIssuedValue}">
                                </td>
                                <td>
                                    <textarea id="remarks_${doc.id}" class="form-control remarks-update" data-doc-id="${doc.id}" style="width: 300px; min-width: 100%; min-height: 20px;">${remarksValue}</textarea>
                                </td>
                                <td>${sendMailButton}</td>
                                ${actionColumn}
                            </tr>
                        `;

                        requestTableBody.innerHTML += tableRow;
                    }
                    itemCount++;
                }
            });
        } else {
            console.log("No documents found.");
        }

        updateDataCountDisplay(itemCount);
        updatePagination(itemCount);
        sessionStorage.setItem("currentPage", pageNumber);
    } catch (error) {
        console.error("Error fetching documents:", error);
    }
}

// Function to update data count display
function updateDataCountDisplay(count) {
    const dataCountElement = document.getElementById("dataCount");
    dataCountElement.textContent = `Total number of data: ${count}`;
}

// Function to update pagination buttons
function updatePagination(itemCount) {
    const paginationContainer = document.getElementById("paginationContainer");
    const totalPages = Math.ceil(itemCount / 25);

    paginationContainer.innerHTML = ""; // Clear previous pagination buttons

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.classList.add("btn", "btn-sm", "btn-outline-primary", "mx-1");
        button.addEventListener("click", function () {
            displayRequests(i);
        });
        paginationContainer.appendChild(button);
    }
}

// Event listener to update status when dropdown value changes
document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("status-update") || event.target.classList.contains("user-update") || event.target.classList.contains("remarks-update") || event.target.classList.contains("date-issued")) {
        const docId = event.target.getAttribute("data-doc-id");
        let updateData = {};

        if (event.target.classList.contains("status-update")) {
            const newStatus = event.target.value;
            updateData = { status: newStatus };
        }

        if (event.target.classList.contains("user-update")) {
            const newUser = event.target.value;
            updateData = { user: newUser };
        }

        if (event.target.classList.contains("remarks-update")) {
            const newRemarks = event.target.value;
            updateData = { remarks: newRemarks };
        }

        if (event.target.classList.contains("date-issued")) {
            const newDateIssued = event.target.value;
            updateData = { dateIssued: newDateIssued };
        }

        try {
            await updateDoc(doc(db, "Request", docId), updateData);
            console.log("Document updated successfully!");

            // Reload the table after status update
            displayRequests(1); // Display first page after update

        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }
});

// Call the function to display requests when the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Get the current page from session storage
    const currentPage = sessionStorage.getItem("currentPage");
    displayRequests(currentPage ? parseInt(currentPage) : 1); // Display the stored page or default to page 1
});


// Define the sendMail function
async function sendMail(docId) {
    try {
        // Retrieve the document from the database to get the email address
        const docRef = doc(db, "Request", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const requestData = docSnap.data();
            const to_email = requestData.emailAddress;

            // Check if email has already been sent
            if (requestData.emailSent !== "Email Sent") {
                // Set the value of the to_email input field in the modal
                document.getElementById("to_email").value = to_email;
                // Set the value of the from_email input field in the modal to the registrar's email
                document.getElementById("sender").value = "registrar_office@aci.edu.ph";
                // Clear the value of the subject input field
                document.getElementById("subject").value = "";
                // Display the modal
                const sendEmailModal = new bootstrap.Modal(document.getElementById('sendEmailModal'));
                sendEmailModal.show();

                // Event listener for "Send Email" button in the modal
                document.getElementById("sendEmail").addEventListener("click", async function() {
                    const subject = document.getElementById("subject").value;

                    // Send email using EmailJS
                    try {
                        await emailjs.send("service_lk0vafp", "template_nn5qpym", {
                            to_email: to_email,
                            from_email: "registrar_office@aci.edu.ph",
                            subject: subject
                        });

                        // Update the document in the database to indicate that the email has been sent
                        await updateDoc(docRef, { 
                            emailSent: "Email Sent", // Update emailSent field to "Email Sent"
                            status: "For Release" // Update status back to "For Release"
                        });

                        // Hide the modal
                        sendEmailModal.hide();
                        // Reload the table to reflect the changes
                        displayRequests(1); // Display first page after update
                    } catch (error) {
                        console.error("Error sending email:", error);
                        // Add your code here to handle errors, like displaying an error message
                    }
                });
            } else {
                // If email has already been sent, display a message or handle it accordingly
                console.log("Email has already been sent for this request.");
                // Remove the "Send Mail" button
                const sendMailButton = document.querySelector(`.send-mail-btn[data-doc-id="${docId}"]`);
                if (sendMailButton) {
                    sendMailButton.remove();
                }
            }
        } else {
            console.error("No such document exists!");
        }
    } catch (error) {
        console.error("Error retrieving document:", error);
    }
}

// Event listener for clicks on "Send Mail" buttons
document.addEventListener("click", async function(event) {
    if (event.target.classList.contains("send-mail-btn")) {
        const docId = event.target.getAttribute("data-doc-id");
        await sendMail(docId);
    }
});



//ADD, EDIT & DELETE FUNCTION ***************************************************************************************************


// Click Edit button888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888

// Create modal instance outside of the functions
const editModal = new bootstrap.Modal(document.getElementById("createRequestModal"));

// Function to open the create modal and set it up for creating a new document
function openCreateModal() {
    const modalTitle = document.getElementById("modalTitle");
    const submitButton = document.getElementById("submitRequest");
    const saveButton = document.getElementById("saveEdit");

    // Setting up the modal for creating new document
    modalTitle.innerText = "Create Document Request";
    submitButton.style.display = "none";
    saveButton.style.display = "block";

    // Clear modal fields
    document.getElementById("idNumber").value = "";
    document.getElementById("surname").value = "";
    document.getElementById("firstName").value = "";
    document.getElementById("middleName").value = "";
    document.getElementById("contactNumber").value = "";
    document.getElementById("emailAddress").value = "";
    document.getElementById("documentRequest").value = "";
    document.getElementById("purpose").value = "";
    document.getElementById("controlNumber").value = "";
    document.getElementById("orNumber").value = "";
    document.getElementById("dateRequested").value = "";

    // Open the modal
    editModal.show();
}

// Function to open the edit modal and populate it with data for editing existing document
async function openEditModal(docId) {
    const modalTitle = document.getElementById("modalTitle");
    const submitButton = document.getElementById("submitRequest");
    const saveButton = document.getElementById("saveEdit");

    // Setting up the modal for editing existing document
    modalTitle.innerText = "Edit Document Request";
    submitButton.style.display = "block";
    saveButton.style.display = "none";

    // Retrieve data from Firestore based on the document ID
    try {
        const docRef = doc(db, "Request", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const requestData = docSnap.data();
            // Populate modal fields with retrieved data
            document.getElementById("idNumber").value = requestData.idNumber;
            document.getElementById("surname").value = requestData.surname;
            document.getElementById("firstName").value = requestData.firstName;
            document.getElementById("middleName").value = requestData.middleName;
            document.getElementById("contactNumber").value = requestData.contactNumber;
            document.getElementById("emailAddress").value = requestData.emailAddress;
            document.getElementById("documentRequest").value = requestData.documentRequest;
            document.getElementById("purpose").value = requestData.purpose;
            document.getElementById("controlNumber").value = requestData.controlNumber;
            document.getElementById("orNumber").value = requestData.orNumber;
            document.getElementById("dateRequested").value = requestData.dateRequested;

            // Set the data-doc-id attribute on the form element
            const form = document.getElementById("documentRequestForm");
            form.setAttribute("data-doc-id", docId);
        } else {
            console.log("Document does not exist!");
        }
    } catch (error) {
        console.error("Error getting document:", error);
    }

    // Open the modal
    editModal.show();
}

// Function to update the document in Firestore
async function updateDocument() {
    // Retrieve the form element
    const form = document.getElementById("documentRequestForm");

    // Get the document ID stored as an attribute of the form
    const docId = form.getAttribute("data-doc-id");

    // Retrieve values from modal fields
    const idNumber = document.getElementById("idNumber").value;
    const surname = document.getElementById("surname").value;
    const firstName = document.getElementById("firstName").value;
    const middleName = document.getElementById("middleName").value;
    const contactNumber = document.getElementById("contactNumber").value;
    const emailAddress = document.getElementById("emailAddress").value;
    const documentRequest = document.getElementById("documentRequest").value;
    const purpose = document.getElementById("purpose").value;
    const controlNumber = document.getElementById("controlNumber").value;
    const orNumber = document.getElementById("orNumber").value;
    const dateRequested = document.getElementById("dateRequested").value;

    // Retrieve the updated status value
    const statusId = `status_${docId}`;
    const updatedStatus = document.getElementById(statusId).value;

    // Retrieve the updated user value
    const userId = `user_${docId}`;
    const updatedUser = document.getElementById(userId).value;

    // Retrieve the updated remarks value
    const remarksId = `remarks_${docId}`;
    const updatedRemarks = document.getElementById(remarksId).value;

    // Construct an object with updated data
    const newData = {
        idNumber: idNumber,
        surname: surname,
        firstName: firstName,
        middleName: middleName,
        contactNumber: contactNumber,
        emailAddress: emailAddress,
        documentRequest: documentRequest,
        purpose: purpose,
        controlNumber: controlNumber,
        orNumber: orNumber,
        dateRequested: dateRequested,
        status: updatedStatus,
        user: updatedUser,
        remarks: updatedRemarks
    };

    // Update the document in Firestore
    try {
        await updateDoc(doc(db, "Request", docId), newData);
        console.log("Document successfully updated!");
        // Reload the table after update
        displayRequests(1);
        // Close the modal
        editModal.hide();
    } catch (error) {
        console.error("Error updating document:", error);
    }
}

// Event listener for submit button in create/edit modal
document.getElementById("documentRequestForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const docId = event.target.getAttribute("data-doc-id");

    if (docId) {
        // If docId exists, it means we are editing an existing document
        updateDocument();
    } else {
        // If docId does not exist, it means we are creating a new document
        submitDocument();
    }
});

// Function to submit the document to Firestore
async function submitDocument() {
    // Retrieve values from modal fields
    const idNumber = document.getElementById("idNumber").value;
    const surname = document.getElementById("surname").value;
    const firstName = document.getElementById("firstName").value;
    const middleName = document.getElementById("middleName").value;
    const contactNumber = document.getElementById("contactNumber").value;
    const emailAddress = document.getElementById("emailAddress").value;
    const documentRequest = document.getElementById("documentRequest").value;
    const purpose = document.getElementById("purpose").value;
    const controlNumber = document.getElementById("controlNumber").value;
    const orNumber = document.getElementById("orNumber").value;
    const dateRequested = document.getElementById("dateRequested").value;

    // Construct an object with form data
    const formData = {
        idNumber: idNumber,
        surname: surname,
        firstName: firstName,
        middleName: middleName,
        contactNumber: contactNumber,
        emailAddress: emailAddress,
        documentRequest: documentRequest,
        purpose: purpose,
        controlNumber: controlNumber,
        orNumber: orNumber,
        dateRequested: dateRequested,
        status: "Pending",
        user: "",
        remarks: ""
    };

    // Add the document to the "Request" collection in Firestore
    try {
        await addDoc(collection(db, "Request"), formData);
        console.log("Document successfully submitted!");
        // Reload the table after submission
        displayRequests(1); // Display first page after update
        // Close the modal
        editModal.hide();
    } catch (error) {
        console.error("Error submitting document:", error);
    }
}


// Initialize the Bootstrap tooltip
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});


// Function to close the edit modal
function closeEditModal() {
    editModal.hide();
}

// Add an event listener for the edit buttons
$(document).ready(function () {
    $(document).on("click", ".edit-btn", function (event) {
        const docId = $(this).attr("data-doc-id");
        if (docId) {
            openEditModal(docId);
        } else {
            console.error("Document ID is null.");
        }
    });
});

// Add an event listener for the delete buttons
$(document).ready(function () {
    $(document).on("click", ".delete-btn", function (event) {
        const docId = $(this).attr("data-doc-id");
        if (docId && confirm("Are you sure you want to delete this document?")) {
            deleteDocument(docId);
        } else {
            console.error("Document ID is null or user canceled delete operation.");
        }
    });
});

// Function to delete a document from Firestore
async function deleteDocument(docId) {
    try {
        await deleteDoc(doc(db, "Request", docId));
        console.log("Document successfully deleted!");
        // Reload the table after deleting the document
        displayRequests(1);
    } catch (error) {
        console.error("Error deleting document:", error);
    }
}

// Event listener to update document when submit button is clicked
$(document).ready(function () {
    $("#submitRequest").on("click", function (event) {
        event.preventDefault();
        updateDocument();
    });
});

// Event listener to add document when save button is clicked
$(document).ready(function () {
    $("#saveEdit").on("click", function (event) {
        event.preventDefault();
        submitDocument(); // Call the function to submit the document to the database
    });
});

// Add an event listener for the close button inside the modal
$('#createRequestModal .btn-close').on('click', function () {
    closeEditModal();
});

// Add an event listener for the create request link
$(document).ready(function () {
    $("#createRequestLink").on("click", function (event) {
        openCreateModal(); // Call the function to open modal for creating new document
    });
});