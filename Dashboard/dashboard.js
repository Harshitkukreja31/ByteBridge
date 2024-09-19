document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');

    dropdownButton.addEventListener('click', function(event) {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        event.stopPropagation();
    });

    document.addEventListener('click', function() {
        dropdownMenu.style.display = 'none';
    });
});

const companySelect = document.getElementById("company-select");
const durationSelect = document.getElementById("duration-select");
const sortSelect = document.getElementById("sort-select");
const difficultyFilter = document.getElementById("difficulty-filter");
const currentSelection = document.getElementById("current-selection");
const calendarContainer = document.getElementById("calendar-container");

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
        if(cellIndex==2){
          cellElement.style.display="none";
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
            localStorage.getItem(checkbox.id) || "false"
          );
  
          if (checkbox.checked) {
            checkboxCount++;
            
          }
  
         
          checkbox.addEventListener("change", function () {
            const dateInput = document.getElementById(`date-${cells[0]}`);
            if (this.checked) {
                const currentDate = formatDate(new Date());
                dateInput.value = currentDate;
                localStorage.setItem(`date-${cells[0]}`, currentDate);
                checkboxCount++;
            } else {
                dateInput.value = "";
                localStorage.removeItem(`date-${cells[0]}`);
                checkboxCount--;
            }
            localStorage.setItem(this.id, this.checked);
            
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
          dateInput.value = localStorage.getItem(`date-${cells[0]}`) || "";
          dateInput.readOnly = true;
          dateInput.disabled = !JSON.parse(
            localStorage.getItem(`attempt-${cells[0]}`) || "false"
          );
  
          dateInput.addEventListener("change", function () {
            localStorage.setItem(this.id, this.value);
          });
  
          cellElement.appendChild(dateInput);
        } else if (index > 0 && cellIndex === cells.length - 1) {
          const noteButton = document.createElement("button");
          noteButton.textContent = "+";
          noteButton.classList.add("note-button");
          noteButton.addEventListener("click", function() {
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
        }
         else {
          cellElement.textContent = cell;
        }

        // if(cellIndex==2){
        //   cellIndex.style.display="none";
        // }
  
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
      .row-count-display {
        padding: 10px 20px;
        margin-top: 20px;
        background-color: #025464;
        border-radius: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-family: Arial, sans-serif;
        font-size: 18px;
        text-align: center;
        color: #ffffff;
        width: 40%;
      }
      .note-button {
        background-color: #4CAF50;
        border: none;
        color: white;
        padding: 5px 10px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
        border-radius: 50%;
      }
      .modal {
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.4);
      }
      .modal-content {
        background-color: #fefefe;
        margin: 15% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
      }
      .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
      }
      .close:hover,
      .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
      }
      #note-textarea {
        width: 100%;
        height: 200px;
        margin-bottom: 10px;
      }
    `;
    document.head.appendChild(style);
  
   
    // const rowCountDisplay = document.createElement("div");
    // rowCountDisplay.className = "row-count-display";
    // tableContainer.insertBefore(rowCountDisplay, tableContainer.firstChild);
    tableContainer.appendChild(table);
    updateProgressDisplay(checkboxCount, rows.length - 1);
    // Create modal for notes
    const modal = document.createElement("div");
    modal.id = "note-modal";
    modal.classList.add("modal");
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Notes for Question <span id="question-id"></span></h2>
        <textarea id="note-textarea"></textarea>
        <button id="save-note">Save Note</button>
      </div>
    `;
    document.body.appendChild(modal);
  
    // Function to open the note modal
    function openNoteModal(questionId) {
      const modal = document.getElementById("note-modal");
      const questionIdSpan = document.getElementById("question-id");
      const noteTextarea = document.getElementById("note-textarea");
      const saveNoteButton = document.getElementById("save-note");
      const closeButton = modal.querySelector(".close");
  
      questionIdSpan.textContent = questionId;
      noteTextarea.value = localStorage.getItem(`note-${questionId}`) || "";
  
      modal.style.display = "block";
  
      saveNoteButton.onclick = function() {
        localStorage.setItem(`note-${questionId}`, noteTextarea.value);
        modal.style.display = "none";
      }
  
      closeButton.onclick = function() {
        modal.style.display = "none";
      }
  
      window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      }
    }
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
