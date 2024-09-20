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
                      checkboxCount++;
                  } else {
                      dateInput.value = "";
                      localStorage.removeItem(getUserSpecificStorageKey(`date-${cells[0]}`));
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


