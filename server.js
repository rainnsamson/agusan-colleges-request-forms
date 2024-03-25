// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  getDoc,
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
document.addEventListener("DOMContentLoaded", function () {
  // Logout button
  var logoutButton = document.getElementById("logout");

  // Attach event listener
  if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default redirect

      // Perform necessary clean-up
      window.location.href = "index.html"; // Redirect to login page
    });
  }

  // Login form validation
  var loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission

      // Get username and password
      var username = document.getElementById("username").value;
      var password = document.getElementById("password").value;

      // Check credentials
      if (username === "aciregistrar" && password === "admin") {
        // Redirect to index.html
        window.location.href = window.location.href = "forms.html";
      } else {
        alert("Invalid username or password. Please try again.");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
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
      var documentRequestDropdown = document.getElementById("documentRequest");
      var documentRequestValue =
        documentRequestDropdown.options[documentRequestDropdown.selectedIndex]
          .text; // Gets the selected text from the dropdown
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
        documentRequest: documentRequestValue, // Save the selected text from the dropdown
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
});

document.getElementById("statusFilter").addEventListener("change", function () {
  var status = this.value; // Get the selected status
  filterTable(status); // Filter the table based on the selected status
});

function filterTable(status) {
  var rows = document.querySelectorAll("#documentRequestsTable tbody tr");
  rows.forEach(function (row) {
    var rowStatus = row.querySelector("td:nth-child(14) select").value; // Get the status of the row
    if (status === "all" || rowStatus === status) {
      row.style.display = ""; // Show the row if status is "all" or matches the selected status
    } else {
      row.style.display = "none"; // Hide the row if it doesn't match the selected status
    }
  });
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("send-email-btn")) {
    var docId = event.target.getAttribute("data-doc-id");
    var docRef = doc(db, "Request", docId);
    getDoc(docRef)
      .then((doc) => {
        if (doc.exists()) {
          var data = doc.data();
          // Populate modal form fields
          document.getElementById("to_email").value = data.to_email;

          // Show the modal
          var modal = new bootstrap.Modal(
            document.getElementById("sendEmailModal")
          );
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

// Close modal when 'Close' button or 'x' is clicked
document
  .querySelector("#sendEmailModal .btn-close")
  .addEventListener("click", function () {
    $("#sendEmailModal").modal("hide");
  });

// Close modal when 'x' is clicked
document
  .querySelector("#sendEmailModal .modal-header button")
  .addEventListener("click", function () {
    $("#sendEmailModal").modal("hide");
  });

// Get the modal element
const createRequestModal = document.getElementById("createRequestModal");
// Get the link element
const createRequestLink = document.getElementById("createRequestLink");
// Get the save button element
const saveEdit = document.getElementById("saveEdit");

// Add click event listener to the link
createRequestLink.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent default link behavior
  // Show the modal
  var modal = new bootstrap.Modal(createRequestModal);
  modal.show();

  // Hide the save button
  if (saveEdit) {
    saveEdit.style.display = "none"; // or visibility: hidden;
  } else {
    console.log("Save button not found!");
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("send-email-btn")) {
    var docId = event.target.getAttribute("data-doc-id");
    var docRef = doc(db, "Request", docId);
    getDoc(docRef)
      .then((doc) => {
        if (doc.exists()) {
          var data = doc.data();
          // Populate modal form fields
          document.getElementById("to_email").value = data.emailAddress || ""; // Use the email from the database, or an empty string if undefined
          document.getElementById("sender").value =
            "registrar_office@aci.edu.ph"; // Set default sender email
          document.getElementById("subject").value = ""; // Set email subject

          // Set up event listener for Send button inside modal
          var sendButton = document.getElementById("sendEmail");
          var emailSent = false;
          sendButton.addEventListener("click", function sendEmailHandler() {
            if (!emailSent) {
              // Prepare email template
              var templateParams = {
                to_email: data.emailAddress,
                subject: document.getElementById("subject").value,
              };

              // Send email using emailjs
              emailjs
                .send("service_lk0vafp", "template_nn5qpym", templateParams)
                .then(
                  function (response) {
                    alert("Email sent successfully:", response);
                    // Close the modal
                    var modal = bootstrap.Modal.getInstance(
                      document.getElementById("sendEmailModal")
                    );
                    modal.hide();
                  },
                  function (error) {
                    alert("Email sending failed:", error);
                  }
                );

              emailSent = true; // Update flag to indicate email has been sent
            }
            sendButton.removeEventListener("click", sendEmailHandler);
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

// UPDATE OR EDIT DATA
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-btn")) {
    var docId = event.target.getAttribute("data-doc-id");
    if (!docId) {
      console.error("Document ID is missing!");
      return;
    }
    var docRef = doc(db, "Request", docId);
    getDoc(docRef)
      .then((doc) => {
        if (doc.exists()) {
          var data = doc.data();
          console.log("Retrieved data:", data);
          // Populate modal form fields with data from Firestore document
          document.getElementById("idNumber").value = data.idNumber;
          document.getElementById("surname").value = data.surname;
          document.getElementById("firstName").value = data.firstName;
          document.getElementById("middleName").value = data.middleName;
          document.getElementById("contactNumber").value = data.contactNumber;
          document.getElementById("emailAddress").value = data.emailAddress;
          document.getElementById("documentRequest").value =
            data.documentRequest;
          document.getElementById("purpose").value = data.purpose;
          document.getElementById("controlNumber").value = data.controlNumber;
          document.getElementById("orNumber").value = data.orNumber;
          document.getElementById("dateRequested").value = data.dateRequested;

          // Show the modal if it exists
          var modalElement = document.getElementById("createRequestModal");
          if (modalElement) {
            var modal = new bootstrap.Modal(modalElement);
            modal.show();

            // Hide the submit button
            var submit = document.getElementById("submit");
            if (submit) {
              submit.style.display = "none"; // or visibility: hidden;
            } else {
              console.log("Submit button not found!");
            }

            // Save button inside the modal
            var saveEdit = document.getElementById("saveEdit");
            saveEdit.addEventListener("click", function () {
              // Update document with new data
              updateDoc(docRef, {
                idNumber: document.getElementById("idNumber").value,
                surname: document.getElementById("surname").value,
                firstName: document.getElementById("firstName").value,
                middleName: document.getElementById("middleName").value,
                contactNumber: document.getElementById("contactNumber").value,
                emailAddress: document.getElementById("emailAddress").value,
                documentRequest:
                  document.getElementById("documentRequest").value,
                purpose: document.getElementById("purpose").value,
                controlNumber: document.getElementById("controlNumber").value,
                orNumber: document.getElementById("orNumber").value,
                dateRequested: document.getElementById("dateRequested").value,
                // Update other fields here...
              })
                .then(() => {
                  console.log("Document successfully updated!");
                  // Close the modal after saving
                  modal.hide();
                  // Reload the page
                  location.reload();
                })
                .catch((error) => {
                  console.error("Error updating document:", error);
                });
            });
          } else {
            console.log("Modal element not found!");
          }
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Define variables for pagination and filtering
  var currentPage = 1;
  var recordsPerPage = 10; // Number of records to display per page
  var currentStatusFilter = "all"; // Default status filter

  // Function to display records based on pagination and status filter
  function displayRecords(records) {
    // Filter records based on the current status filter
    var filteredRecords = records.filter(function (record) {
      return (
        currentStatusFilter === "all" || record.status === currentStatusFilter
      );
    });

    // Calculate pagination variables
    var startIndex = (currentPage - 1) * recordsPerPage;
    var endIndex = startIndex + recordsPerPage;
    var paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // Render the paginated and filtered records into the table
    var tableBody = document.getElementById("documentRequestsBody");
    tableBody.innerHTML = ""; // Clear existing table rows
    paginatedRecords.forEach(function (record, index) {
      var newRow = tableBody.insertRow();
      // Inside the displayRecords function where table rows are constructed
      newRow.innerHTML = `
<td class="table-cell">${startIndex + index + 1}</td>
<td class="table-cell">${record.idNumber}</td>
<td class="table-cell">${record.surname}</td>
<td class="table-cell">${record.firstName}</td>
<td class="table-cell">${record.middleName}</td>
<td class="table-cell">${record.contactNumber}</td>
<td class="table-cell">${record.emailAddress}</td>
<td class="table-cell">${record.documentRequest}</td>
<td class="table-cell">${record.purpose}</td>
<td class="table-cell">${record.controlNumber}</td>
<td class="table-cell">${record.orNumber}</td>
<td class="table-cell">${record.dateRequested}</td>
<td>
    <input type="date" class="form-control date-released-input table-cell" value="${
      record.dateReleased ? record.dateReleased : ""
    }">
</td>
<td class="table-cell">
    <div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle status-dropdown" type="button" id="statusDropdown${index}" data-bs-toggle="dropdown" aria-expanded="false">
            ${record.status}
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="statusDropdown${index}">
            <li><button class="dropdown-item status-update dropdown-menu-item" data-doc-id="${
              record.id
            }" data-status="Pending">Pending</button></li>
            <li><button class="dropdown-item status-update dropdown-menu-item" data-doc-id="${
              record.id
            }" data-status="Processing">Processing</button></li>
            <li><button class="dropdown-item status-update dropdown-menu-item" data-doc-id="${
              record.id
            }" data-status="Signature">Signature</button></li>
            <li><button class="dropdown-item status-update dropdown-menu-item" data-doc-id="${
              record.id
            }" data-status="Release">Release</button></li>
            <li><button class="dropdown-item status-update dropdown-menu-item" data-doc-id="${
              record.id
            }" data-status="Received">Received</button></li>
        </ul>
    </div>
</td>
<td class="table-cell">
    <select class="form-select user-select table-cell">
        <option value="" disabled selected>Select User</option>
        <option value="jbermoy" ${
          record.user === "jbermoy" ? "selected" : ""
        }>jbermoy</option>
        <option value="nclaro" ${
          record.user === "nclaro" ? "selected" : ""
        }>nclaro</option>
        <option value="rbasanal" ${
          record.user === "rbasanal" ? "selected" : ""
        }>rbasanal</option>
        <option value="fodlime" ${
          record.user === "fodlime" ? "selected" : ""
        }>fodlime</option>
    </select>
</td>
<td contenteditable="true" class="remarks table-cell" style="max-width: 300px; min-height: 50px; max-height: 150px; overflow-y: auto; resize: vertical;">${
        record.remarks
      }</td>
<td class="table-cell"><button class="btn btn-primary send-email-btn" data-doc-id="${
        record.id
      }" style="${
        record.status !== "Release" ? "display: none;" : ""
      }">Send Email</button></td>
<td class="table-cell"><button class="btn btn-secondary edit-btn" data-doc-id="${
        record.id
      }">Edit</button></td>
`;
    });

    // Display pagination controls
    var totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    var paginationButtons = document.getElementById("paginationButtons");
    paginationButtons.innerHTML = `
            <ul class="pagination">
                <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                    <button class="page-link" id="prevPage" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </button>
                </li>
        `;
    for (let i = 1; i <= totalPages; i++) {
      paginationButtons.innerHTML += `
                <li class="page-item ${currentPage === i ? "active" : ""}">
                    <button class="page-link page" data-page="${i}">${i}</button>
                </li>
            `;
    }
    paginationButtons.innerHTML += `
                <li class="page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }">
                    <button class="page-link" id="nextPage" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </button>
                </li>
            </ul>
        `;
  }

  // Declare the fetchRecords function here
  function fetchRecords() {
    getDocs(collection(db, "Request"))
      .then((querySnapshot) => {
        var records = [];
        querySnapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() });
        });
        displayRecords(records); // Display records in the table
      })
      .catch((error) => {
        console.error("Error fetching documents: ", error);
      });
  }

  // Call the fetchRecords function after its declaration
  fetchRecords();

  // Event listener for pagination buttons
  document
    .getElementById("paginationButtons")
    .addEventListener("click", function (event) {
      if (event.target.id === "prevPage" && currentPage > 1) {
        currentPage--;
        fetchRecords();
      } else if (event.target.id === "nextPage") {
        currentPage++;
        fetchRecords();
      } else if (event.target.classList.contains("page")) {
        currentPage = parseInt(event.target.dataset.page);
        fetchRecords();
      }
    });

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("status-update")) {
      var docId = event.target.getAttribute("data-doc-id");
      var newStatus = event.target.getAttribute("data-status");
      // Update status in Firestore document

      updateDoc(doc(db, "Request", docId), { status: newStatus })
        .then(() => {
          console.log("Document status updated successfully!");
          fetchRecords(); // Refresh records after status update
        })
        .catch((error) => {
          console.error("Error updating document status: ", error);
        });
    }
  });

  // Event listener for status filter dropdown
  document
    .getElementById("statusFilter")
    .addEventListener("change", function () {
      currentStatusFilter = this.value; // Update the current status filter
      fetchRecords(); // Fetch and display records based on the new filter
    });

  // Event listener for updating remarks on keypress (Enter)
  document.addEventListener("keypress", function (event) {
    if (event.target.classList.contains("remarks") && event.key === "Enter") {
      var docId = event.target.parentElement
        .querySelector(".edit-btn")
        .getAttribute("data-doc-id");
      var newRemarks = event.target.textContent.trim();
      // Update remarks in Firestore document
      updateDoc(doc(db, "Request", docId), { remarks: newRemarks })
        .then(() => {
          console.log("Remarks updated successfully!");
          fetchRecords(); // Refresh records after remarks update
        })
        .catch((error) => {
          console.error("Error updating remarks: ", error);
        });
    }
  });

  // Event listener for updating date released
  document.addEventListener("change", function (event) {
    if (event.target.classList.contains("date-released-input")) {
      var docId = event.target.parentElement.parentElement
        .querySelector(".edit-btn")
        .getAttribute("data-doc-id");
      var newDateReleased = event.target.value;
      // Update dateReleased in Firestore document
      updateDoc(doc(db, "Request", docId), { dateReleased: newDateReleased })
        .then(() => {
          console.log("Date Released updated successfully!");
          fetchRecords(); // Refresh records after date released update
        })
        .catch((error) => {
          console.error("Error updating Date Released: ", error);
        });
    }
  });

  // Event listener for user selection dropdown
  document.addEventListener("change", function (event) {
    if (event.target.classList.contains("user-select")) {
      var docId = event.target
        .closest("tr")
        .querySelector(".edit-btn")
        .getAttribute("data-doc-id");
      var newUser = event.target.value;

      // Update user in Firestore document
      updateDoc(doc(db, "Request", docId), { user: newUser })
        .then(() => {
          console.log("Document user updated successfully!");
          // Optionally, you can refresh the records if needed
          // fetchRecords();
        })
        .catch((error) => {
          console.error("Error updating document user: ", error);
        });
    }
  });

  // Event listener for sending email button when the status is 'Release'
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("send-email-btn")) {
      var docId = event.target.getAttribute("data-doc-id");
      // Get the status of the document
      var docRef = doc(db, "Request", docId);
      getDoc(docRef)
        .then((doc) => {
          if (doc.exists()) {
            var status = doc.data().status;
            if (status === "Release") {
              // Add code to send email here
              console.log("Sending email for document with ID:", docId);
            } else {
              console.log(
                "Cannot send email for document with ID:",
                docId,
                "because status is not 'Release'."
              );
            }
          } else {
            console.log("Document not found with ID:", docId);
          }
        })
        .catch((error) => {
          console.error("Error getting document:", error);
        });
    }
  });
});
