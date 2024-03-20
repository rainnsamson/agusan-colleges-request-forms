// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
    getFirestore,
    addDoc,
    collection,
    getDocs,
    updateDoc,
    doc,
    deleteDoc
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
            documentRequest: documentRequest,
            purpose: purpose,
            controlNumber: controlNumber,
            orNumber: orNumber,
            dateRequested: dateRequested,
            dateIssued: "", // Set initial value to empty string
            status: status, // Save status value
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

// Event listener for status change and date issued update
document.addEventListener("change", function (event) {
    if (event.target.classList.contains("statusSelect")) {
        const docId = event.target.getAttribute("data-doc-id");
        const newStatus = event.target.value;

        // Update status in Firestore
        updateDoc(doc(db, "Request", docId), {
            status: newStatus,
        })
            .then(() => {
                alert("Status updated");
                // Reload the page to display the updated data
                location.reload();
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
            });
    }

    if (event.target.classList.contains("dateIssuedInput")) {
        const docId = event.target.getAttribute("data-doc-id");
        const newDateIssued = event.target.value;

        updateDoc(doc(db, "Request", docId), {
            dateIssued: newDateIssued,
        })
            .then(() => {
                alert("Date Issued updated");
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
            });
    }
});

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
                    } data-doc-id="${doc.id}" ${dateIssued ?? "disabled"}>
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
                    }>Received</option>
                </select>`;

            var deleteIcon = `<i class="fas fa-trash-alt delete-icon hide" data-doc-id="${doc.id}"></i>`; // Delete icon

            var row = `
                <tr>
                    <td>${count}</td> <!-- Add the count -->
                    <td>${data.idNumber}</td>
                    <td>${data.surname}</td>
                    <td>${data.firstName}</td>
                    <td>${data.middleName}</td>
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
                    <td style="text-align: center;">
                        ${deleteIcon}
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

        // Hide the entire 'Action' column initially
        var actionColumn = document.querySelectorAll("#documentRequestsTable tbody tr td:last-child");
        actionColumn.forEach((column) => {
            column.style.display = "none";
        });

        // Toggle visibility of 'Action' column when the lock icon is clicked
        var lockIcon = document.querySelector("#lockIcon");
        lockIcon.addEventListener("click", function() {
            actionColumn.forEach((column) => {
                column.style.display = column.style.display === "none" ? "" : "none";
            });

            // Change lock icon to unlock icon and vice versa
            lockIcon.classList.toggle("fa-lock");
            lockIcon.classList.toggle("fa-unlock");
        });
    });
});


// Event listener for delete icon
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-icon")) {
        const docId = event.target.getAttribute("data-doc-id");
        if (confirm("Are you sure you want to delete this data?")) {
            // Delete data from Firestore
            deleteDoc(doc(db, "Request", docId))
                .then(() => {
                    alert("Data deleted");
                    // Remove the row from the table
                    event.target.closest("tr").remove();
                    // Reload the page
                    location.reload();
                })
                .catch((error) => {
                    console.error("Error deleting document: ", error);
                });
        }
    }
});


document.getElementById("statusFilter").addEventListener("change", function() {
    var status = this.value; // Get the selected status
    filterTable(status); // Filter the table based on the selected status
});

function filterTable(status) {
    var rows = document.querySelectorAll("#documentRequestsTable tbody tr");
    rows.forEach(function(row) {
        var rowStatus = row.querySelector("td:nth-child(12) select").value; // Get the status of the row
        if (status === "all" || rowStatus === status) {
            row.style.display = ""; // Show the row if status is "all" or matches the selected status
        } else {
            row.style.display = "none"; // Hide the row if it doesn't match the selected status
        }
    });
}



