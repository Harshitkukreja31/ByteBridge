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


