document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');

    // dropdownButton.addEventListener('click', function(event) {
    //     dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    //     event.stopPropagation();
    // });

    // document.addEventListener('click', function() {
    //     dropdownMenu.style.display = 'none';
    // });
});
function showSidebar(){
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'flex'
}
function hideSidebar(){
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'none'
}

function logout() {
  // Clear the current user from localStorage
  localStorage.removeItem('currentUser');
  
  // Optionally, clear any other user-specific data
  // For example, if you have any session-related data:
  // localStorage.removeItem('userSessionData');
  
  // Redirect to the login page or home page
  window.location.href = "../Landing Page/index.html"; 
}


const companySelect = document.getElementById("company-select");
const durationSelect = document.getElementById("duration-select");
const sortSelect = document.getElementById("sort-select");
const difficultyFilter = document.getElementById("difficulty-filter");
const currentSelection = document.getElementById("current-selection");
const calendarContainer = document.getElementById("calendar-container");

//user-related functions
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

function setCurrentUser(username) {
  localStorage.setItem('currentUser', username);
}

function getUserData(username) {
  const userData = localStorage.getItem(username);
  return userData ? JSON.parse(userData) : { problems: {}, companies: [] };
}

function setUserData(username, data) {
  localStorage.setItem(username, JSON.stringify(data));
}

document.addEventListener("DOMContentLoaded", function () {
    fetch("company_data.json")
      .then((response) => response.json())
      .then((data) => initializeDropdowns(data))
      .catch((error) => console.error("Error loading company data:", error));
});

function initializeDropdowns(companyData) {
    Object.keys(companyData).forEach((company) => {
      const option = document.createElement("option");
      option.value = company;
      option.textContent = company.charAt(0).toUpperCase() + company.slice(1);
      companySelect.appendChild(option);
    });
  
    companySelect.addEventListener("change", function () {
      const selectedCompany = companySelect.value;
      const durations = companyData[selectedCompany];
  
      durationSelect.innerHTML = '<option value="">Select Duration</option>';
      durations.forEach((duration) => {
        const option = document.createElement("option");
        option.value = duration;
        option.textContent = formatDuration(duration);
        durationSelect.appendChild(option);
      });
  
      updateCompanyLogo(selectedCompany);
    });
  
    function updateDisplay() {
      const company = companySelect.value;
      const duration = durationSelect.value;
      const sort = sortSelect.value;
      const difficulty = difficultyFilter.value;
  
      const logoImg = document.getElementById("company-logo");
      const currentSelection = document.getElementById("current-selection");
  
      if (company && duration) {
        currentSelection.textContent = `${
          company.charAt(0).toUpperCase() + company.slice(1)
        } - ${formatDuration(duration)} Problems`;
        updateCompanyLogo(company);
        loadCompanyQuestions(company, duration, sort, difficulty);
      } else {
        logoImg.style.display = "none";
        currentSelection.textContent = "";
        // clearTable();
      }
    }
  
    companySelect.addEventListener("change", updateDisplay);
    durationSelect.addEventListener("change", updateDisplay);
    sortSelect.addEventListener("change", updateDisplay);
    difficultyFilter.addEventListener("change", updateDisplay);
}
function formatDuration(duration) {
    return duration
      .replace("months", " Months")
      .replace("year", " Year")
      .replace("alltime", "All Time");
}
function updateCompanyLogo(companyName) {
    const logoImg = document.getElementById("company-logo");
    logoImg.src = `https://logo.clearbit.com/${companyName}.com`;
    logoImg.style.display = "block";
}

function loadCompanyQuestions(company, duration, sort, difficulty) {
    const csvFile = `data/LeetCode-Questions-CompanyWise/${company}_${duration}.csv`;
    fetch(csvFile)
      .then((response) => response.text())
      .then((csvText) => {
        displayTable(csvText, sort, difficulty);
      })
      .catch((error) => console.error("Failed to load data:", error));
}
let checkboxCount = 0;
let rows;


function displayTable(csvData, sort, difficulty) {
  const tableContainer = document.getElementById("table-container");

  tableContainer.innerHTML = "";

  let rows = csvData.split("\n").filter((row) => row.trim());
  const header = rows.shift();
  rows.unshift(header + ",Attempted,Date Solved,Notes");

  if (sort) {
      rows = sortRows(rows, sort, header);
  }

  if (difficulty) {
      rows = filterRows(rows, difficulty, header);
  }

  const table = document.createElement("table");
  table.classList.add("styled-table");
  let checkboxCount = 0;

  rows.forEach((row, index) => {
      const tr = document.createElement("tr");
      const cells = row.split(",");

      if (index > 0) {
          cells.push(""); // For 'Attempted' checkbox
          cells.push(""); // For 'Date Solved' input
          cells.push(""); // For 'Notes' button
      }

      cells.forEach((cell, cellIndex) => {
          const cellElement = document.createElement(index === 0 ? "th" : "td");
          cellElement.classList.add("table-cell");

          if (index === 0) {
              cellElement.classList.add("table-header");
          }
          if (cellIndex == 2) {
              cellElement.style.display = "none"; // Hide specific column if necessary
          }

          if (index === 0 && cellIndex === cells.length - 3) {
              cellElement.textContent = "Attempted";
          } else if (index === 0 && cellIndex === cells.length - 2) {
              cellElement.textContent = "Date Solved";
          } else if (index === 0 && cellIndex === cells.length - 1) {
              cellElement.textContent = "Notes";
          } else if (index > 0 && cellIndex === cells.length - 3) {
              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.classList.add("attempt-checkbox");
              checkbox.id = `attempt-${cells[0]}`;
              checkbox.checked = JSON.parse(
                  localStorage.getItem(getUserSpecificStorageKey(checkbox.id)) || "false"
              );

              if (checkbox.checked) {
                  checkboxCount++;
              }

              checkbox.addEventListener("change", function () {
                  const dateInput = document.getElementById(`date-${cells[0]}`);
                  if (this.checked) {
                      const currentDate = formatDate(new Date());
                      dateInput.value = currentDate;
                      localStorage.setItem(getUserSpecificStorageKey(`date-${cells[0]}`), currentDate);
                      localStorage.setItem(getUserSpecificStorageKey(`company-${cells[0]}`), companySelect.value);
                      checkboxCount++;
                  } else {
                      dateInput.value = "";
                      localStorage.removeItem(getUserSpecificStorageKey(`date-${cells[0]}`));
                      localStorage.removeItem(getUserSpecificStorageKey(`company-${cells[0]}`));
                      checkboxCount--;
                  }
                  localStorage.setItem(getUserSpecificStorageKey(this.id), this.checked);
                  
                  // Update the progress display immediately
                  updateProgressDisplay(checkboxCount, rows.length - 1);
              });

              const label = document.createElement("label");
              label.classList.add("checkbox-label");
              label.appendChild(checkbox);
              cellElement.appendChild(label);
          } else if (index > 0 && cellIndex === cells.length - 2) {
              const dateInput = document.createElement("input");
              dateInput.type = "text";
              dateInput.id = `date-${cells[0]}`;
              dateInput.classList.add("date-input");
              dateInput.value = localStorage.getItem(getUserSpecificStorageKey(`date-${cells[0]}`)) || "";
              dateInput.readOnly = true;
              dateInput.disabled = !JSON.parse(
                  localStorage.getItem(getUserSpecificStorageKey(`attempt-${cells[0]}`)) || "false"
              );

              dateInput.addEventListener("change", function () {
                  localStorage.setItem(getUserSpecificStorageKey(this.id), this.value);
              });

              cellElement.appendChild(dateInput);
          } else if (index > 0 && cellIndex === cells.length - 1) {
              const noteButton = document.createElement("button");
              noteButton.textContent = "+";
              noteButton.classList.add("note-button");
              noteButton.addEventListener("click", function () {
                  openNoteModal(cells[0]);
              });
              cellElement.appendChild(noteButton);
          } else if (index > 0 && cellIndex === 5) {
              cellElement.classList.add("link-cell");
              const link = document.createElement("a");
              link.href = cell;
              link.target = "_blank";
              const leetCodeIcon = new Image();
              leetCodeIcon.src = "leetcode.svg";
              leetCodeIcon.alt = "LeetCode";
              leetCodeIcon.classList.add("leetcode-icon");
              link.appendChild(leetCodeIcon);
              cellElement.appendChild(link);
          } else if (cellIndex === 3) {
              const difficultyTag = document.createElement("span");
              difficultyTag.classList.add("difficulty-tag");

              if (cell === "Easy") {
                  difficultyTag.classList.add("difficulty-easy");
              } else if (cell === "Medium") {
                  difficultyTag.classList.add("difficulty-medium");
              } else if (cell === "Hard") {
                  difficultyTag.classList.add("difficulty-hard");
              }
              difficultyTag.textContent = cell;
              cellElement.appendChild(difficultyTag);
          } else if (index > 0 && cellIndex === 4) {
              cellElement.textContent = `${parseFloat(cell).toFixed(2)}%`;
          } else {
              cellElement.textContent = cell;
          }

          tr.appendChild(cellElement);
      });

      table.appendChild(tr);
  });

  const style = document.createElement("style");
  style.textContent = `
      .styled-table {
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
          font-size: 0.9em;
          font-family: sans-serif;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
      }
      .table-cell {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
      }
      .table-header {
          background-color: #009879;
          color: white;
      }
      .attempt-checkbox {
          width: 20px;
          height: 20px;
      }
      .checkbox-label {
          display: flex;
          justify-content: center;
          align-items: center;
      }
      .date-input {
          width: 100%;
          padding: 5px;
          font-size: 1em;
          border: 1px solid #ccc;
          border-radius: 5px;
          text-align: center;
      }
      .link-cell {
          display: flex;
          justify-content: center;
          align-items: center;
      }
      .leetcode-icon {
          height: 30px;
          width: 30px;
      }
      .difficulty-tag {
          padding: 5px 10px;
          border-radius: 20px;
          font-weight: bold;
      }
      .difficulty-easy {
          background-color: #00b8a3;
          color: white;
      }
      .difficulty-medium {
          background-color: #ffc01e;
          color: black;
      }
      .difficulty-hard {
          background-color: #ff375f;
          color: white;
      }
      .note-button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 5px 10px;
          text-align: center;
          font-size: 16px;
          border-radius: 50%;
      }
      .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          align-items: center;
          justify-content: center;
      }
      .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          width: 400px;
          max-width: 90%;
          position: relative;
      }
      .close {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 28px;
          cursor: pointer;
      }
      #note-textarea {
          width: 100%;
          height: 150px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
          resize: none;
      }
      #save-note {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
          margin-top: 10px;
          font-size: 16px;
      }
      #save-note:hover {
          background-color: #45a049;
      }
  `;
  document.head.appendChild(style);

  tableContainer.appendChild(table);
  updateProgressDisplay(checkboxCount, rows.length - 1);
  
  // Create modal for notes
  const modal = document.createElement("div");
  modal.id = "note-modal";
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const closeButton = document.createElement("span");
  closeButton.classList.add("close");
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => {
      modal.style.display = "none";
  };

  const noteTextarea = document.createElement("textarea");
  noteTextarea.id = "note-textarea";
  noteTextarea.placeholder = "Write your notes here...";

  const saveNoteButton = document.createElement("button");
  saveNoteButton.id = "save-note";
  saveNoteButton.textContent = "Save Note";
  saveNoteButton.onclick = function () {
        const problemId = modal.dataset.problemId;
        const note = noteTextarea.value;
        localStorage.setItem(getUserSpecificStorageKey(`note-${problemId}`), note);
        modal.style.display = "none";
  };
  modalContent.appendChild(closeButton);
  modalContent.appendChild(noteTextarea);
  modalContent.appendChild(saveNoteButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  function openNoteModal(problemId) {
    const savedNote = localStorage.getItem(getUserSpecificStorageKey(`note-${problemId}`)) || "";
    noteTextarea.value = savedNote;
    modal.dataset.problemId = problemId;
    modal.style.display = "flex";
  }
  window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
  };
}

// Helper function to create user-specific localStorage keys
function getUserSpecificStorageKey(key) {
  const currentUser = localStorage.getItem('currentUser');
  return `${currentUser}-${key}`;
}


function formatDate(date) {
    const nth = (d) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
  
    let day = date.getDate();
    let month = date.toLocaleString("default", { month: "long" });
    let year = date.getFullYear();
    let hour = date.getHours() % 12 || 12; // Convert to 12 hour format
    let minute = date.getMinutes().toString().padStart(2, "0");
    let ampm = date.getHours() >= 12 ? "PM" : "AM";
  
    return `${day}${nth(day)} ${month} ${year}, ${hour}:${minute} ${ampm}`;
}
function updateProgressDisplay(checkboxCount, totalRows) {
  setProgress(checkboxCount, totalRows);
}

var progDisplay=true;
function setProgress(answered, total) {
  const circle = document.querySelector('.progress-ring__circle--fg');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  const progress = answered / total;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference - (progress * circumference);

  document.querySelector('.progress-ring__answered').textContent = answered;
  document.querySelector('.progress-ring__total').textContent = total;
  if(progDisplay==true){
    document.querySelector('.progress-ring').style.display="block";
  }
  else{
    document.querySelector('.progress-ring').style.display="none";
  }
  
}



//calender:

function createCalendar(year, month) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
  ];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  calendarContainer.innerHTML = `

    
    <div class="calendar">
      <div class="calendar-header">
        <span class="month-year">${monthNames[month]} ${year}</span>
        <div class="nav-buttons">
          <button class="prev-month">&lt;</button>
          <button class="next-month">&gt;</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>S</th>
            <th>M</th>
            <th>T</th>
            <th>W</th>
            <th>T</th>
            <th>F</th>
            <th>S</th>
          </tr>
        </thead>
        <tbody id="calendar-body"></tbody>
      </table>
    </div>
  `;

  
  const tbody = document.getElementById('calendar-body');

  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement('td');
      if (i === 0 && j < firstDay.getDay()) {
        row.appendChild(cell);
      } else if (date > lastDay.getDate()) {
        break;
      } else {
        const count = getQuestionCountForDay(year, month, date);
        
        cell.innerHTML = `
          <div class="date">${date}</div>
          <div class="count">${count}</div>
        `;
        cell.classList.add('day');
        cell.dataset.count = count;
        
        if (date === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
          cell.classList.add('today');
        }
        
        row.appendChild(cell);
        date++;
      }
    }
    tbody.appendChild(row);
  }

  // Add event listeners for navigation buttons
  document.querySelector('.prev-month').addEventListener('click', () => {
    createCalendar(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
  });
  document.querySelector('.next-month').addEventListener('click', () => {
    createCalendar(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1);
  });
}

// Update the CSS for the calendar
const style = document.createElement('style');
style.textContent = `
 #calendar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.calendar {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 380px;
  overflow: hidden;
}

.calendar-header {
  background-color: hsl(166.1, 58.1%, 57.8%);
  padding: 20px;
  font-size: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333;
  border-bottom: 1px solid #e5e7eb;
}

.nav-buttons button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 5px 10px;
  color: #4a5568;
  transition: color 0.3s ease;
}

.nav-buttons button:hover {
  color: #2d3748;
}

.calendar table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 3px;
}

.calendar th, .calendar td {
  text-align: center;
  vertical-align: middle;
  padding: 10px;
}

.calendar th {
  background-color: #f9fafb;
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.calendar td {
  position: relative;
  height: 40px;
  width: 40px;
  cursor: pointer;

  transition: background-color 0.3s ease, color 0.3s ease;
}

.calendar td:hover:not(:empty) {
  background-color: #e2e8f0;
}

.calendar .date {
  font-size: 14px;
  color: black;
}

.calendar .count {
  font-size: 10px;
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-weight: bold;
  color: #4a5568;
}

.day.today {
  color: white;
  font-weight: bold;
}

.day.today:hover {
  background-color: #2563eb;
}

.day[data-count="0"] { 
  background-color: white; 
}

.day { 
  background-color: #10b981; 
  color: white;
}
.day.today{
  background-color: #3b82f6;
}
.day:hover {
  opacity: 0.9;
  
`;
document.head.appendChild(style);

// The rest of your code remains

function getQuestionCountForDay(year, month, day) {
  const date = new Date(year, month, day);
  const dateString = formatDate(date).split(',')[0]; // Format date and get only the date part (without time)
  const currentUser = localStorage.getItem('currentUser');
  let count = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Ensure that the key belongs to the current user and starts with 'date-'
      if (key.startsWith(`${currentUser}-date-`)) {
          const storedDate = localStorage.getItem(key);
          if (storedDate.startsWith(dateString)) {
              count++;
          }
      }
  }
  
  return count;
}






// Initial calendar creation
createCalendar(new Date().getFullYear(), new Date().getMonth());


//sort all the rows
function sortRows(rows, sort, header) {
  const headerParts = header.split(",");
  const sortKey = sort.split("-")[0].trim();
  // Adjust the sort key to match the header case
  const capitalizedSortKey =
    sortKey.charAt(0).toUpperCase() + sortKey.slice(1).toLowerCase();
  const columnIndex = headerParts.indexOf(capitalizedSortKey);

  if (columnIndex === -1) {
    console.error("Sort key not found in header:", capitalizedSortKey);
    return rows; // Return unsorted rows to prevent further errors
  }

  const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
  const isAscending = sort.includes("asc"); // Determine sorting order

  rows.sort((a, b) => {
    let rowA = a.split(",");
    let rowB = b.split(",");
    let valA = rowA[columnIndex];
    let valB = rowB[columnIndex];

    if (valA === undefined || valB === undefined) {
      console.error(
        "Undefined value found for sort key",
        capitalizedSortKey,
        "at index",
        columnIndex
      );
      return 0;
    }

    valA = valA.trim();
    valB = valB.trim();

    if (capitalizedSortKey === "Frequency") {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    } else if (capitalizedSortKey === "Difficulty") {
      valA = difficultyOrder[valA];
      valB = difficultyOrder[valB];
    }

    if (valA < valB) {
      return isAscending ? -1 : 1; // Adjust return based on sorting order
    } else if (valA > valB) {
      return isAscending ? 1 : -1; // Adjust return based on sorting order
    }
    return 0;
  });
  return rows;
}


function filterRows(rows, difficulty, header) {
  const headerParts = header.split(",");
  const columnIndex = headerParts.indexOf("Difficulty");
  
  // Separate the header from the data rows
  const [headerRow, ...dataRows] = rows;
  
  // Filter only the data rows
  const filteredDataRows = dataRows.filter(
    (row) => row.split(",")[columnIndex].trim() === difficulty
  );
  
  // Return the header row followed by the filtered data rows
  return [headerRow, ...filteredDataRows];
}

//search functionaliy
document.getElementById("search-button").addEventListener("click", () => {
  const id = document.getElementById("id-search").value.trim();
  if (id) {
    searchByID(id);
  }
});

document.getElementById("id-search").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default action to avoid submitting the form
    const id = document.getElementById("id-search").value.trim();
    if (id) {
      searchByID(id);
    }
  }
});

function searchByID(id) {
  fetch("company_data.json")
    .then((response) => response.json())
    .then((data) => {
      const tableData = {};
      let foundTitle = "";
      let foundLink = "";
      let idFound = false;

      const promises = Object.entries(data).flatMap(([company, durations]) => {
        return durations.map((duration) => {
          const csvFile = `data/LeetCode-Questions-CompanyWise/${company}_${duration}.csv`;
          return fetch(csvFile)
            .then((response) => response.text())
            .then((csvText) => {
              const rows = csvText.split("\n").filter((row) => row.trim());
              const header = rows.shift().split(",");
              const idIndex = header.findIndex((col) => col.trim() === "ID");
              const titleIndex = header.findIndex(
                (col) => col.trim() === "Title"
              );
              const linkIndex = header.findIndex(
                (col) => col.trim() === "Leetcode Question Link"
              );
              const frequencyIndex = header.findIndex(
                (col) => col.trim() === "Frequency"
              );

              rows.forEach((row) => {
                const cells = row.split(",");
                if (cells[idIndex].trim() === id) {
                  idFound = true;
                  foundTitle = cells[titleIndex].trim();
                  foundLink = cells[linkIndex].trim();
                  const frequency = parseFloat(cells[frequencyIndex].trim());

                  if (!tableData[company]) {
                    tableData[company] = {};
                  }
                  tableData[company][duration] =
                    (tableData[company][duration] || 0) + frequency;
                }
              });
            });
        });
      });

      Promise.all(promises)
        .then(() => {
          if (idFound) {
            Object.keys(tableData).forEach((company) => {
              Object.keys(tableData[company]).forEach((duration) => {
                tableData[company][duration] =
                  tableData[company][duration].toFixed(2);
              });
            });
            displaySearchResults(tableData, foundTitle, foundLink);
          } else {
            return fetch("problem_data.json");
          }
        })
        .then((response) => {
          if (response) return response.json();
        })
        .then((problemData) => {
          if (problemData) {
            const problem = problemData[id];
            if (problem) {
              const problemNameSlug = problem["Problem Name"]
                .toLowerCase()
                .replace(/ /g, "-");
              const problemLink = `https://leetcode.com/problems/${problemNameSlug}/description/`;
              displaySearchResults({}, problem["Problem Name"], problemLink);
            } else {
              console.log("Problem ID not found in the data.");
            }
          }
        })
        .catch((error) => console.error("Error in search process:", error));
    })
    .catch((error) => console.error("Error loading company data:", error));
}



function displaySearchResults(data, title, link) {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";

  // Create a container for all content
  const contentContainer = createContentContainer();

  // Create a container for title and link
  const titleLinkContainer = createTitleLinkContainer(title, link);

  // Checkbox logic
  const checkboxId = parseInt(document.getElementById("id-search").value);
  const titleCheckbox = setupTitleCheckbox(checkboxId);
  titleLinkContainer.appendChild(titleCheckbox);

  contentContainer.appendChild(titleLinkContainer);

  if (Object.keys(data).length === 0) {
    const noDataMsg = createNoDataMessage();
    contentContainer.appendChild(noDataMsg);
  } else {
    const companyCount = createCompanyCountMessage(data);
    contentContainer.appendChild(companyCount);

    const table = createResultsTable(data);
    contentContainer.appendChild(table);
  }

  tableContainer.appendChild(contentContainer);
  addResponsiveStyles();
}

function createContentContainer() {
  const container = document.createElement("div");
  Object.assign(container.style, {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06)",
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    width: "95%",
  });
  return container;
}

function createTitleLinkContainer(title, link) {
  const container = document.createElement("div");
  Object.assign(container.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
  });

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;
  Object.assign(titleElement.style, {
    fontSize: "clamp(18px, 4vw, 24px)",
    margin: "0 10px 0 0",
    textAlign: "center",
  });

  const linkElement = createLinkElement(link);
  container.appendChild(titleElement);
  container.appendChild(linkElement);

  return container;
}

function createLinkElement(link) {
  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", link);
  linkElement.target = "_blank";
  linkElement.style.display = "inline-flex";
  linkElement.style.alignItems = "center";
  linkElement.style.textDecoration = "none";
  linkElement.style.color = "#1a73e8";
  linkElement.style.marginTop = "5px";

  const leetCodeIcon = new Image();
  leetCodeIcon.src = "leetcode.svg";
  leetCodeIcon.alt = "LeetCode";
  leetCodeIcon.style.width = "24px";
  leetCodeIcon.style.height = "24px";
  leetCodeIcon.style.marginRight = "5px";

  linkElement.appendChild(leetCodeIcon);
  linkElement.appendChild(document.createTextNode("LeetCode"));

  return linkElement;
}

function setupTitleCheckbox(checkboxId) {
  const titleCheckbox = document.createElement("input");
  titleCheckbox.type = "checkbox";
  titleCheckbox.id = "title-checkbox";
  titleCheckbox.style.marginRight = "10px";
  
  // Use your specific storage key function
  const storageKey = getUserSpecificStorageKey(`attempt-${checkboxId}`);
  titleCheckbox.checked = getLocalStorageItem(storageKey);

  titleCheckbox.addEventListener("change", function () {
    if (this.checked) {
      localStorage.setItem(storageKey, this.checked);
      const currentDate = formatDate(new Date());
      localStorage.setItem(getUserSpecificStorageKey(`date-${checkboxId}`), currentDate);
    } else {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(getUserSpecificStorageKey(`date-${checkboxId}`));
      localStorage.removeItem(getUserSpecificStorageKey(`companies-${checkboxId}`));
    }
  });

  return titleCheckbox;
}

function createNoDataMessage() {
  const noDataMsg = document.createElement("p");
  noDataMsg.textContent = "The question was not asked in any company.";
  noDataMsg.style.textAlign = "center";
  noDataMsg.style.fontSize = "16px";
  return noDataMsg;
}

function createCompanyCountMessage(data) {
  const companyCount = document.createElement("p");
  companyCount.textContent = `Number of companies: ${Object.keys(data).length}`;
  companyCount.style.textAlign = "center";
  companyCount.style.fontSize = "16px";
  companyCount.style.marginBottom = "20px";
  return companyCount;
}

function createResultsTable(data) {
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "separate";
  table.style.borderSpacing = "0 10px";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const companyNameHeader = document.createElement("th");
  companyNameHeader.style.backgroundColor = "#4a69bd";
  companyNameHeader.style.color = "white";
  companyNameHeader.style.padding = "12px 15px";
  companyNameHeader.style.textAlign = "left";
  companyNameHeader.textContent = "Company";

  const frequencyHeader = document.createElement("th");


  headerRow.appendChild(companyNameHeader);
  headerRow.appendChild(frequencyHeader);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  Object.entries(data).forEach(([company, durations], index) => {
    const row = document.createElement("tr");
    row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";
    row.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
    row.style.transition = "all 0.3s ease";

    const companyNameCell = createCompanyNameCell(company);
    row.appendChild(companyNameCell);

    const frequencyCell = createFrequencyCell(durations);
    row.appendChild(frequencyCell);
    thead.style.display="none";
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  const companyInfo=document.getElementsByClassName("company-info");
  companyInfo[0].style.display="none";
  const prog=document.getElementsByClassName("progress-ring");
  prog[0].style.display="none";
  return table;
}

function createCompanyNameCell(company) {
  const cell = document.createElement("td");
  cell.style.padding = "12px 15px";
  cell.style.borderBottom = "1px solid #e0e0e0";
  cell.style.display = "flex";
  cell.style.alignItems = "center";
  cell.style.flexWrap = "wrap";

  const companyLogo = createCompanyLogo(company);
  cell.appendChild(companyLogo);

  const companyName = document.createElement("span");
  companyName.textContent = company[0].toUpperCase() + company.slice(1).toLowerCase();
  companyName.style.wordBreak = "break-word";
  cell.appendChild(companyName);

  return cell;
}

function createCompanyLogo(company) {
  const logoDiv = document.createElement("div");
  logoDiv.style.width = "32px";
  logoDiv.style.height = "32px";
  logoDiv.style.marginRight = "10px";
  logoDiv.style.flexShrink = "0";
  logoDiv.style.borderRadius = "50%";
  logoDiv.style.display = "flex";
  logoDiv.style.alignItems = "center";
  logoDiv.style.justifyContent = "center";
  logoDiv.style.fontSize = "16px";
  logoDiv.style.fontWeight = "bold";
  logoDiv.style.color = "white";
  logoDiv.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
  logoDiv.textContent = company[0].toUpperCase();

  const img = new Image();
  img.src = `https://logo.clearbit.com/${company}.com`;
  img.alt = company;
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.borderRadius = "50%";
  img.style.objectFit = "cover";
  img.style.backgroundColor = "white";

  img.onload = () => {
    logoDiv.textContent = '';
    logoDiv.appendChild(img);
  };

  return logoDiv;
}

function createFrequencyCell(durations) {
  const cell = document.createElement("td");
  cell.style.padding = "12px 15px";
  cell.style.borderBottom = "1px solid #e0e0e0";
  cell.style.display = "flex";
  cell.style.flexWrap = "wrap";
  cell.style.gap = "5px";

  Object.entries(durations).forEach(([duration, frequency]) => {
    const tag = document.createElement("span");
    tag.textContent = `${Math.ceil(frequency * 100)}% (${duration})`;
    tag.style.display = "inline-block";
    tag.style.padding = "4px 8px";
    tag.style.borderRadius = "12px";
    tag.style.fontSize = "12px";
    tag.style.color = "white";
    tag.style.marginBottom = "5px";
    tag.style.backgroundColor = getFrequencyColor(frequency);
    cell.appendChild(tag);
  });

  return cell;
}

function getFrequencyColor(frequency) {
  const freqValue = parseFloat(frequency);
  if (freqValue >= 0.7) return "#4CAF50";
  else if (freqValue >= 0.4) return "#FFA500";
  return "#f44336";
}

function addResponsiveStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 600px) {
      #table-container table, #table-container tbody, #table-container tr, #table-container td {
        display: block;
        width: 100%;
      }
      #table-container thead {
        display: none;
      }
      #table-container tr {
        margin-bottom: 15px;
      }
      #table-container td {
        text-align: left;
        padding: 12px 15px;
      }
      #table-container td:last-child {
        border-bottom: none;
      }
    }
  `;
  document.head.appendChild(style);
}

// Local Storage Helper
function getLocalStorageItem(key, defaultValue = false) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

// Clear the table
function clearUIElements() {
  
  document.getElementById("table-container").innerHTML = "";
  document.getElementById("current-selection").innerText = "";
  document.getElementById("company-logo").style.display = "none";
  document.getElementById("id-search").value = "";
  

  document.getElementById("company-select").selectedIndex = 0;
  document.getElementById("duration-select").selectedIndex = 0;
  document.getElementById("sort-select").selectedIndex = 0;
  document.getElementById("difficulty-filter").selectedIndex = 0;

  progDisplay=false;
  updateProgressDisplay(checkboxCount, rows.length - 1);
  progDisplay=true;
}

// Add the event listener to the clear button
document
  .getElementById("clear-button")
  .addEventListener("click", clearUIElements);

function clearTable() {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";
}



