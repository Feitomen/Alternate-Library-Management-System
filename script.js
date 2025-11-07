/*****************************************
 ✅ LOCAL DATABASE NAME FOR USER ACCOUNTS
*****************************************/
const USER_DB = "user_database_v1";

/*****************************************
 ✅ YOUR ORIGINAL VARIABLES (UNCHANGED)
*****************************************/
const BOOK_DB = "library_books_v1";
const BORROW_DB = "library_borrowed_v1";

let books = [];
let borrowed = [];
let currentUser = null;

// ✅ FIX: Get table reference for Borrowed List
const claimedTable = document.getElementById("claimedTable");
const searchBtn = document.getElementById("searchBtn");
const showAllBtn = document.getElementById("showAllBtn");


/*****************************************
 ✅ POPUP NOTIFICATION SYSTEM
*****************************************/
function showPopup(message, type = "error") {
  const popup = document.getElementById("popup");
  popup.innerText = message;
  popup.className = `popup ${type} show`;

  setTimeout(() => popup.classList.remove("show"), 2500);
}


/*****************************************
 ✅ SWITCH LOGIN ↔ REGISTER PAGE
*****************************************/
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");

document.getElementById("openRegister").onclick = () => {
  loginPage.style.display = "none";
  registerPage.style.display = "block";
};

document.getElementById("openLogin").onclick = () => {
  registerPage.style.display = "none";
  loginPage.style.display = "block";
};


/*****************************************
 ✅ REGISTER NEW USER (SAVED TO LOCAL STORAGE)
*****************************************/
function registerUser() {
  let name = regFullname.value.trim();
  let uname = regUsername.value.trim();
  let pass = regPassword.value.trim();

  if (!name || !uname || !pass) {
    registerPage.classList.add("shake");
    setTimeout(() => registerPage.classList.remove("shake"), 500);
    return showPopup("⚠️ Fill all fields!", "error");
  }

  let userDB = JSON.parse(localStorage.getItem(USER_DB)) || [];

  if (userDB.some(u => u.username === uname)) {
    return showPopup("❌ Username already taken!", "error");
  }

  userDB.push({
    fullname: name,
    username: uname,
    password: pass,
    role: "client"
  });

  localStorage.setItem(USER_DB, JSON.stringify(userDB));

  showPopup("✅ Account created! You may now log in.", "success");

  regFullname.value = "";
  regUsername.value = "";
  regPassword.value = "";

  registerPage.style.display = "none";
  loginPage.style.display = "block";
}


/*****************************************
 ✅ LOAD/SAVE ORIGINAL DATABASES
*****************************************/
function saveDB() {
  localStorage.setItem(BOOK_DB, JSON.stringify(books));
  localStorage.setItem(BORROW_DB, JSON.stringify(borrowed));
}

function loadDB() {
  books = JSON.parse(localStorage.getItem(BOOK_DB)) || [];
  borrowed = JSON.parse(localStorage.getItem(BORROW_DB)) || [];
  saveDB();
}


/*****************************************
 ✅ UPDATED LOGIN — NOW USES LOCAL STORAGE USERS
*****************************************/
function login() {
  const user = username.value.trim();
  const pass = password.value.trim();

  let userDB = JSON.parse(localStorage.getItem(USER_DB)) || [];

  let found = userDB.find(u => u.username === user && u.password === pass);

  // ✅ Admin still supported
  if (!found && user === "admin" && pass === "1234") {
    found = { username: "admin", fullname: "Admin", role: "admin" };
  }

  if (!found) {
    loginPage.classList.add("shake");
    setTimeout(() => loginPage.classList.remove("shake"), 500);
    return showPopup("❌ Wrong username or password!", "error");
  }

  currentUser = found;

  loginPage.style.display = "none";
  mainWebsite.style.display = "block";

  // ✅ Admin / Client role buttons
  document.querySelectorAll(".adminOnly").forEach(el =>
    el.style.display = currentUser.role === "admin" ? "inline-block" : "none"
  );

  document.querySelectorAll(".clientOnly").forEach(el =>
    el.style.display = currentUser.role === "client" ? "inline-block" : "none"
  );

  updateClaimedList();
  showSection("home");

  showPopup(`✅ Welcome ${found.fullname || found.username}!`, "success");
}


/*****************************************
 ✅ LOGOUT (UNCHANGED)
*****************************************/
function logout() {
  currentUser = null;
  mainWebsite.style.display = "none";
  loginPage.style.display = "block";
  username.value = "";
  password.value = "";
  showPopup("✅ Logged out successfully!", "success");
}


/*****************************************
 ✅ SHOW SECTIONS (UNCHANGED)
*****************************************/
function showSection(id) {
  document.querySelectorAll(".content-section").forEach(sec =>
    sec.classList.remove("active")
  );
  document.getElementById(id).classList.add("active");

  if (id === "search") showAllBooks();
}


/*****************************************
 ✅ ADD BOOK (UNCHANGED)
*****************************************/
function addBook() {
  const id = bookId.value.trim();
  const title = bookTitle.value.trim();
  const author = bookAuthor.value.trim();
  const msg = addBookMsg;

  if (id && title && author) {
    books.push({
      id,
      title,
      author,
      category: "-",
      status: "Available"
    });

    saveDB();
    msg.innerText = `✅ Book "${title}" added successfully!`;
    bookId.value = bookTitle.value = bookAuthor.value = "";
  } else {
    msg.innerText = "⚠️ Please fill in all fields.";
  }
}


/*****************************************
 ✅ BORROW BOOK (UNCHANGED)
*****************************************/
function borrowBook() {
  const idInput = borrowBookId.value.trim();
  const borrowerName = clientName.value.trim();
  const studentIdInput = studentId.value.trim();
  const contactInput = contactNumber.value.trim();
  const categoryInput = borrowCategory.value;
  const msg = borrowMsg;

  if (!idInput || !borrowerName || !studentIdInput || !contactInput || !categoryInput) {
    msg.textContent = "⚠️ Please fill out all fields.";
    msg.style.color = "orange";
    return;
  }

  const foundBook = books.find(book => book.id.toLowerCase() === idInput.toLowerCase());

  if (!foundBook) {
    msg.textContent = "❌ Book not found.";
    msg.style.color = "red";
    return;
  }

  if (borrowed.some(b => b.bookid === foundBook.id && b.status !== "Returned")) {
    msg.textContent = "⚠️ This book is already borrowed.";
    msg.style.color = "orange";
    return;
  }

  borrowed.push({
    bookid: foundBook.id,
    title: foundBook.title,
    borrower: borrowerName,
    studentId: studentIdInput,
    contact: contactInput,
    category: categoryInput,
    dateBorrowed: new Date().toLocaleString(),
    dateReturned: "-",
    status: "Borrowed"
  });

  foundBook.status = "Borrowed";

  saveDB();

  msg.textContent = "✅ Book borrowed successfully!";
  msg.style.color = "lightgreen";

  borrowBookId.value = clientName.value = studentId.value =
    contactNumber.value = borrowCategory.value = "";

  updateClaimedList();
  showAllBooks();
}


/*****************************************
 ✅ RETURN BOOK (UNCHANGED)
*****************************************/
function returnBook() {
  const bookIdInput = returnBookId.value.trim();
  const msg = returnMsg;

  if (!bookIdInput) {
    msg.textContent = "⚠️ Enter a Book ID.";
    msg.style.color = "orange";
    return;
  }

  const borrowIndex = borrowed.findIndex(
    b => b.bookid.toLowerCase() === bookIdInput.toLowerCase()
  );

  if (borrowIndex === -1) {
    msg.textContent = "❌ Book not found in borrowed records.";
    msg.style.color = "red";
    return;
  }

  borrowed[borrowIndex].status = "Returned";
  borrowed[borrowIndex].dateReturned = new Date().toLocaleString();

  const book = books.find(b => b.id.toLowerCase() === bookIdInput.toLowerCase());
  if (book) book.status = "Available";

  saveDB();

  msg.textContent = "✅ Book returned successfully!";
  msg.style.color = "lightgreen";
  returnBookId.value = "";

  updateClaimedList();
  showAllBooks();
}


/*****************************************
 ✅ UPDATE CLAIMED LIST (UNCHANGED)
*****************************************/
function updateClaimedList() {
  claimedTable.innerHTML = `
    <tr>
      <th>Book ID</th>
      <th>Title</th>
      <th>Borrower</th>
      <th>Student ID</th>
      <th>Contact</th>
      <th>Category</th>
      <th>Date Borrowed</th>
      <th>Date Returned</th>
      <th>Status</th>
    </tr>
  `;

  borrowed.forEach(b => {
    claimedTable.innerHTML += `
      <tr>
        <td>${b.bookid}</td>
        <td>${b.title}</td>
        <td>${b.borrower}</td>
        <td>${b.studentId}</td>
        <td>${b.contact}</td>
        <td>${b.category}</td>
        <td>${b.dateBorrowed}</td>
        <td>${b.dateReturned}</td>
        <td>${b.status}</td>
      </tr>
    `;
  });
}


/*****************************************
 ✅ SEARCH & SHOW ALL BOOKS (UNCHANGED)
*****************************************/
function searchBook() {
  const query = searchInput.value.trim().toLowerCase();
  const tableBody = document.getElementById("searchTableBody");

  tableBody.innerHTML = "";

  const availableBooks = books.filter(b => b.status === "Available");

  const results = availableBooks.filter(book =>
    book.id.toLowerCase().includes(query) ||
    book.title.toLowerCase().includes(query) ||
    book.category.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="color:red;">❌ No available books found.</td></tr>`;
    return;
  }

  results.forEach(book => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${book.id}</td>
      <td>${book.title}</td>
      <td>${book.category}</td>
      <td style="color:green;font-weight:bold;">Available</td>
    `;
    tableBody.appendChild(row);
  });
}

function showAllBooks() {
  const tableBody = document.getElementById("searchTableBody");

  tableBody.innerHTML = "";

  const availableBooks = books.filter(b => b.status === "Available");

  if (availableBooks.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="color:red;">❌ No available books in the library.</td></tr>`;
    return;
  }

  availableBooks.forEach(book => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${book.id}</td>
      <td>${book.title}</td>
      <td>${book.category}</td>
      <td style="color:green;font-weight:bold;">Available</td>
    `;
    tableBody.appendChild(row);
  });
}


/*****************************************
 ✅ BUTTON EVENTS (UNCHANGED)
*****************************************/
searchBtn.addEventListener("click", searchBook);
showAllBtn.addEventListener("click", showAllBooks);


/*****************************************
 ✅ LOAD DB WHEN PAGE OPENS
*****************************************/
window.addEventListener("load", () => {
  loadDB();
  showAllBooks();
  updateClaimedList();
});
