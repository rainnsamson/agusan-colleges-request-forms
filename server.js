// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    doc,
    addDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";


// Your web app's Firebase configuration
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
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// LOGIN AND LOGOUT
document.addEventListener("DOMContentLoaded", function() {
    // Logout button
    var logoutButton = document.getElementById("logout");

    // Attach event listener
    if (logoutButton) {
        logoutButton.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent default redirect

            // Perform necessary clean-up
            window.location.href = "index.html"; // Redirect to login page
        });
    }
    
 // Login form validation
 var loginForm = document.getElementById('loginForm');
 if (loginForm) {
     loginForm.addEventListener('submit', function(event) {
         event.preventDefault(); // Prevent default form submission

         // Get username and password
         var username = document.getElementById('username').value;
         var password = document.getElementById('password').value;

         // Check credentials
         if (username === 'aciregistrar' && password === 'admin') {
             // Redirect to index.html
             window.location.href = window.location.href = 'forms.html';
            } else {
                alert('Invalid username or password. Please try again.');
            }
        });
    }
});

// Event listener for submit button
var submitButton = document.getElementById("submit");
if (submitButton) {
    submitButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent the form from submitting normally

        // Retrieve all form fields
        var idNumber = document.getElementById("idNumber").value;
        var surname = document.getElementById("surname").value;
        var firstName = document.getElementById("firstName").value;
        var middleName = document.getElementById("middleName").value;
        var contactNumber = document.getElementById("contactNumber").value;
        var emailAddress = document.getElementById("emailAddress").value;
        var documentRequest = document.getElementById("documentRequest").value;
        var purpose = document.getElementById("purpose").value;
        var controlNumber = document.getElementById("controlNumber").value;
        var orNumber = document.getElementById("orNumber").value;
        var dateRequested = document.getElementById("dateRequested").value;
        var status = "Pending"; // Default status is 'Pending' for new requests

        // Add a new document in collection "Request"
        addDoc(collection(db, "Request"), {
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
            dateIssued: "", // Set initial value to empty string
            status: status, // Save status value
            user: "", // Save user as blank
            remarks: "", // Save remarks as blank
        })
            .then(() => {
                alert("Request added");
                // Clear the form after successful submission
                document.getElementById("documentRequestForm").reset();
                // Reload the page to display the new data
                location.reload();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    });
}


document.addEventListener("DOMContentLoaded", function() {
    // Display data in table
    getDocs(collection(db, "Request")).then((querySnapshot) => {
        var count = 0; // Initialize count
        querySnapshot.forEach((doc) => {
            count++; // Increment count for each document
            var data = doc.data();
            var dateIssued = data.dateIssued ? data.dateIssued : ""; // Set initial value to empty string
            var dateIssuedInput = `
                <div class="input-group">
                    <input type="date" class="form-control icon-input dateIssuedInput" ${
                        data.dateIssued ? `value="${data.dateIssued}"` : ""
                    } data-doc-id="${doc.id}" id="dateIssuedInput-${doc.id}">
                </div>`;
        
            // Dropdown for status
            var statusDropdown = `
                <select class="form-select statusSelect" data-doc-id="${doc.id}">
                    <option value="Pending" ${
                        data.status === "Pending" ? "selected" : ""
                    }>Pending</option>
                    <option value="Processing" ${
                        data.status === "Processing" ? "selected" : ""
                    }>Processing</option>
                    <option value="Signature" ${
                        data.status === "Signature" ? "selected" : ""
                    }>Signature</option>
                    <option value="Release" ${
                        data.status === "Release" ? "selected" : ""
                    }>Release</option>
                    <option value="Received" ${
                        data.status === "Received" ? "selected" : ""
                    }>Received by Student</option>
                </select>`;
        
            // Dropdown for user
            var userDropdown = `
                <div class="input-group">
                    <select class="form-select userSelect" id="userSelect${count}" data-doc-id="${doc.id}">
                        <option value="" disabled selected>Please select user</option>
                        <option value="jbermoy" ${data.user === "jbermoy" ? "selected" : ""}>jbermoy</option>
                        <option value="nclaro" ${data.user === "nclaro" ? "selected" : ""}>nclaro</option>
                        <option value="rbasanal" ${data.user === "rbasanal" ? "selected" : ""}>rbasanal</option>
                    </select>
                </div>`;

           // Input field for remarks
var remarksInput = `<input type="text" class="form-control remarks-input" value="${data.remarks}" data-doc-id="${doc.id}">`;

            var sendEmailButton = "";
            if (data.status === "Release") {
                sendEmailButton = `<button type="button" class="btn btn-primary send-email-btn" data-doc-id="${doc.id}">Send</button>`;
            }

            var row = `
<tr>
    <td>${count}</td> <!-- Add the count -->
    <td>${data.idNumber}</td>
    <td>${data.surname}</td>
    <td>${data.firstName}</td>
    <td>${data.middleName}</td>
    <td>${data.contactNumber}</td>
    <td>${data.emailAddress}</td>
    <td>${data.documentRequest}</td>
    <td>${data.purpose}</td>
    <td>${data.controlNumber}</td>
    <td>${data.orNumber}</td>
    <td>${data.dateRequested}</td>
    <td>
        <div class="input-group">
            ${dateIssuedInput}
        </div>
    </td>
    <td>
        <div class="input-group">
            ${statusDropdown}
        </div>
    </td>
    <td>
        <div class="input-group">
            ${userDropdown}
        </div>
    </td>
    <td>
        <div class="input-group">
            ${remarksInput}
        </div>
    </td>
    <td style="text-align: center;">
        ${sendEmailButton}
    </td>
</tr>
`;

            var tableBody = document.querySelector("#documentRequestsTable tbody");
            if (tableBody) {
                tableBody.innerHTML += row;
            }
        });

        // Update data count
        var dataCountElement = document.querySelector("#dataCount");
        if (dataCountElement) {
            dataCountElement.innerText = `Data Count: ${count}`;
        }

        // Event listener for status change
        var statusSelects = document.querySelectorAll(".statusSelect");
        statusSelects.forEach((select) => {
            // Save the original value
            select.setAttribute("data-original-value", select.value);

            select.addEventListener("change", function() {
                var newStatus = this.value;
                var docId = this.getAttribute("data-doc-id");
                if (confirm("Are you sure you want to change the status?")) {
                    // User clicked OK, proceed with status update
                    updateDoc(doc(db, "Request", docId), { status: newStatus })
                        .then(() => {
                            alert("Status updated successfully");
                            // Reload the page
                            location.reload();
                        })
                        .catch((error) => {
                            console.error("Error updating status: ", error);
                        });
                } else {
                    // User clicked Cancel, do nothing
                    // Reset the select element to its original value
                    this.value = this.getAttribute("data-original-value");
                }
            });
        });

        // Event listener for user change
        var userSelects = document.querySelectorAll(".userSelect");
        userSelects.forEach((select) => {
            select.addEventListener("change", function() {
                var newUser = this.value;
                var docId = this.getAttribute("data-doc-id");
                // Check if the selected user is not blank and confirm update
                if (newUser !== "" && confirm("Are you sure you want to update the user?")) {
                    updateDoc(doc(db, "Request", docId), { user: newUser })
                        .then(() => {
                            alert("User updated successfully");
                        })
                        .catch((error) => {
                            console.error("Error updating user: ", error);
                        });
                } else {
                    // Reset the select element to its original value
                    this.value = this.getAttribute("data-original-value");
                }
            });
        });

        // Event listener for remarks input field
        var remarksInputs = document.querySelectorAll(".remarks-input");
        remarksInputs.forEach((input) => {
            input.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    event.preventDefault(); // Prevent default behavior (e.g., form submission)
                    var remarks = this.value;
                    var docId = this.getAttribute("data-doc-id");
                    if (confirm("Are you sure you want to update remarks?")) {
                        updateDoc(doc(db, "Request", docId), {
                            remarks: remarks
                        }).then(() => {
                            console.log("Document successfully updated!");
                        }).catch((error) => {
                            console.error("Error updating document: ", error);
                        });
                    }
                }
            });
        });

        // Event listener for date issued input field
        var dateIssuedInputs = document.querySelectorAll(".dateIssuedInput");
        dateIssuedInputs.forEach((input) => {
            input.addEventListener("change", function() {
                var newDateIssued = this.value;
                var docId = this.getAttribute("data-doc-id");
                updateDoc(doc(db, "Request", docId), { dateIssued: newDateIssued })
                    .then(() => {
                        console.log("Date Issued updated successfully");
                    })
                    .catch((error) => {
                        console.error("Error updating Date Issued: ", error);
                    });
            });
        });
    });
});

document.getElementById("statusFilter").addEventListener("change", function() {
    var status = this.value; // Get the selected status
    filterTable(status); // Filter the table based on the selected status
});

function filterTable(status) {
    var rows = document.querySelectorAll("#documentRequestsTable tbody tr");
    rows.forEach(function(row) {
        var rowStatus = row.querySelector("td:nth-child(14) select").value; // Get the status of the row
        if (status === "all" || rowStatus === status) {
            row.style.display = ""; // Show the row if status is "all" or matches the selected status
        } else {
            row.style.display = "none"; // Hide the row if it doesn't match the selected status
        }
    });
}

document.addEventListener("click", function(event) {
    if (event.target.classList.contains("send-email-btn")) {
        var docId = event.target.getAttribute("data-doc-id");
        var docRef = doc(db, "Request", docId);
        getDoc(docRef)
            .then((doc) => {
                if (doc.exists()) {
                    var data = doc.data();
                    // Populate modal form fields
                    document.getElementById("to_email").value = data.to_email || ''; // Use the email from the database, or an empty string if undefined
                    document.getElementById("sender").value = 'registrar_office@aci.edu.ph'; // Set default sender email

                    // Show the modal
                    var modal = new bootstrap.Modal(document.getElementById('sendEmailModal'));
                    modal.show();
                } else {
                    console.log("No such document!");
                }
            })
            .catch((error) => {
                console.error("Error getting document:", error);
            });
    }
});

document.getElementById('sendEmail').addEventListener('click', function() {
    var sender = document.getElementById('sender').value;
    var to_email = document.getElementById('to_email').value;
    var subject = document.getElementById('subject').value;

    var templateParams = {
        sender: sender,
        to_email: to_email,
        subject: subject
    };

    emailjs.send('service_lk0vafp', 'template_nn5qpym', templateParams)
        .then(function(response) {
            console.log('Email sent successfully', response);
            alert('Email sent successfully');
            document.getElementById('subject').value = '';
            $('#sendEmailModal').modal('hide'); // Hide modal
        }, function(error) {
            console.error('Email sending failed', error);
            alert('Email sending failed');
        });
});

// Close modal when 'Close' button or 'x' is clicked
document.querySelector('#sendEmailModal .btn-close').addEventListener('click', function() {
    $('#sendEmailModal').modal('hide');
});

// Close modal when 'x' is clicked
document.querySelector('#sendEmailModal .modal-header button').addEventListener('click', function() {
    $('#sendEmailModal').modal('hide');
});

// Get the modal element
const createRequestModal = document.getElementById('createRequestModal');
// Get the link element
const createRequestLink = document.getElementById('createRequestLink');

// Add click event listener to the link
createRequestLink.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default link behavior
    // Show the modal
    var modal = new bootstrap.Modal(createRequestModal);
    modal.show();
});

document.addEventListener("click", function(event) {
    if (event.target.classList.contains("send-email-btn")) {
        var docId = event.target.getAttribute("data-doc-id");
        var docRef = doc(db, "Request", docId);
        getDoc(docRef)
            .then((doc) => {
                if (doc.exists()) {
                    var data = doc.data();
                    // Populate modal form fields
                    document.getElementById("to_email").value = data.emailAddress || ''; // Use the email from the database, or an empty string if undefined
                    document.getElementById("sender").value = 'registrar_office@aci.edu.ph'; // Set default sender email

                    // Set up event listener for Send button inside modal
                    document.getElementById("sendEmail").addEventListener("click", function() {
                        // Prepare email template
                        var templateParams = {
                            to_email: data.emailAddress,
                           
                        };

                        // Send email using emailjs
                        emailjs.send('service_lk0vafp', 'template_nn5qpym', templateParams)
                            .then(function(response) {
                                console.log('Email sent successfully:', response);
                                // Close the modal
                                var modal = bootstrap.Modal.getInstance(document.getElementById('sendEmailModal'));
                                modal.hide();
                            }, function(error) {
                                console.error('Email sending failed:', error);
                            });
                    });
                } else {
                    console.log("No such document!");
                }
            })
            .catch((error) => {
                console.error("Error getting document:", error);
            });
    }
});


