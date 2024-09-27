function showSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'flex'
  }
  function hideSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'none'
}

// User object constructor


function User(username) {
    this.username = username;
    this.joinDate = new Date(localStorage.getItem(username + 'joinDate') || new Date().toISOString());
    this.solvedProblems = {};
    this.companyData = {};
}



// Method to add a solved problem
User.prototype.addSolvedProblem = function(problemId, difficulty, companies) {
    this.solvedProblems[problemId] = {
        difficulty: difficulty,
        solvedDate: new Date(),
        companies: companies
    };

    companies.forEach(company => {
        if (!this.companyData[company]) {
            this.companyData[company] = { easy: 0, medium: 0, hard: 0, total: 0 };
        }
        this.companyData[company][difficulty.toLowerCase()]++;
        this.companyData[company].total++;
    });
};

// Method to get user statistics
User.prototype.getStatistics = function() {
    let totalProblems = Object.keys(this.solvedProblems).length;
    let easyProblems = 0, mediumProblems = 0, hardProblems = 0;

    Object.values(this.solvedProblems).forEach(problem => {
        switch (problem.difficulty.toLowerCase()) {
            case 'easy': easyProblems++; break;
            case 'medium': mediumProblems++; break;
            case 'hard': hardProblems++; break;
        }
    });

    return { totalProblems, easyProblems, mediumProblems, hardProblems };
};

// Method to display user summary
// User.prototype.displaySummary = function() {
//     const stats = this.getStatistics();
//     const summaryElement = document.createElement('div');
//     summaryElement.className = 'bg-gray-800 p-6 rounded-lg shadow-lg mt-8';
//     summaryElement.innerHTML = `
//         <h2 class="text-2xl font-semibold mb-4">User Summary</h2>
//         <p>Username: ${this.username}</p>
//         <p>Join Date: ${this.joinDate.toLocaleDateString()}</p>
//         <p>Total Problems Solved: ${stats.totalProblems}</p>
//         <p>Easy Problems: ${stats.easyProblems}</p>
//         <p>Medium Problems: ${stats.mediumProblems}</p>
//         <p>Hard Problems: ${stats.hardProblems}</p>
//         <h3 class="text-xl font-semibold mt-4 mb-2">Top Companies:</h3>
//     `;

//     const topCompanies = Object.entries(this.companyData)
//         .sort((a, b) => b[1].total - a[1].total)
//         .slice(0, 5);

//     topCompanies.forEach(([company, data]) => {
//         summaryElement.innerHTML += `
//             <p>${company}: ${data.total} (Easy: ${data.easy}, Medium: ${data.medium}, Hard: ${data.hard})</p>
//         `;
//     });

//     document.querySelector('.container').appendChild(summaryElement);
// };



  

let currentUser;

function getUserKey(key) {
    return `${currentUser.username}-${key}`;
}

function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function loadUserInfo() {
    document.getElementById('username').textContent = `Username: ${currentUser.username}`;
    document.getElementById('joinDate').textContent = `Joined: ${currentUser.joinDate.toLocaleDateString()}`;
}

function searchByID(id) {
    return fetch("../Dashboard/company_data.json")
        .then(response => response.json())
        .then(data => {
            const tableData = {};
            let idFound = false;

            const promises = Object.entries(data).flatMap(([company, durations]) => {
                return durations.map(duration => {
                    const csvFile = `../Dashboard/data/LeetCode-Questions-CompanyWise/${company}_${duration}.csv`;
                    return fetch(csvFile)
                        .then(response => response.text())
                        .then(csvText => {
                            const rows = csvText.split("\n").filter(row => row.trim());
                            const header = rows.shift().split(",");
                            const idIndex = header.findIndex(col => col.trim() === "ID");

                            rows.forEach(row => {
                                const cells = row.split(",");
                                if (cells[idIndex].trim() === id) {
                                    idFound = true;
                                    if (!tableData[company]) {
                                        tableData[company] = {};
                                    }
                                    tableData[company][duration] = (tableData[company][duration] || 0) + 1;
                                }
                            });
                        });
                });
            });

            return Promise.all(promises).then(() => {
                if (!idFound) {
                    return fetch("problem_data.json").then(response => response.json());
                }
                return tableData;
            });
        })
        .catch(error => console.error("Error in search process:", error));
}

async function loadUserStats() {
    const problemIds = Object.keys(currentUser.solvedProblems);

    const [problemData, companyData] = await Promise.all([
        fetch('../Dashboard/problem_data.json').then(response => response.json()),
        fetchCompanyData(problemIds)
    ]);

    problemIds.forEach(problemId => {
        const problem = problemData[problemId];
        if (problem) {
            currentUser.addSolvedProblem(problemId, problem.Difficulty, companyData[problemId] || []);
        }
    });

    const stats = currentUser.getStatistics();
    updateStatsDisplay(stats.totalProblems, stats.easyProblems, stats.mediumProblems, stats.hardProblems);
    createDifficultyPieChart(stats.easyProblems, stats.mediumProblems, stats.hardProblems);
    createCompanyBarChart(currentUser.companyData);
}

async function fetchCompanyData(problemIds) {
    const companyData = {};

    for (const id of problemIds) {
        await searchByID(id).then((tableData) => {
            companyData[id] = Object.keys(tableData);
        });
    }

    return companyData;
}

function updateStatsDisplay(total, easy, medium, hard) {
    document.getElementById('totalProblems').textContent = `Total Problems Solved: ${total}`;
    document.getElementById('easyProblems').textContent = `Easy Problems: ${easy}`;
    document.getElementById('mediumProblems').textContent = `Medium Problems: ${medium}`;
    document.getElementById('hardProblems').textContent = `Hard Problems: ${hard}`;
}

function createDifficultyPieChart(easy, medium, hard) {
    const ctx = document.getElementById('difficultyPieChart').getContext('2d');

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Easy', 'Medium', 'Hard'],
            datasets: [{
                data: [easy, medium, hard],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Problem Difficulty Distribution'
                }
            }
        }
    });
}

let companyBarChart;

function createCompanyBarChart(companyData) {
    const ctx = document.getElementById('companyBarChart').getContext('2d');
    
    const labels = Object.keys(companyData);
    const data = {
        labels: labels,
        datasets: [{
            label: 'Total Problems',
            data: labels.map(company => companyData[company].total),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };
    
    companyBarChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Company Problem Distribution'
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    return companyBarChart;
}

function adjustFontSize() {
    const width = window.innerWidth;
    let fontSize;
    if (width < 400) fontSize = 8;
    else if (width < 600) fontSize = 10;
    else fontSize = 12;
    
    if (companyBarChart) {
        companyBarChart.options.scales.x.ticks.font = { size: fontSize };
        companyBarChart.options.scales.y.ticks.font = { size: fontSize };
        companyBarChart.update();
    }
}

User.prototype.showSummary = async function() {
    const table = document.getElementById("summaryTable");
    const banner = document.getElementById("questionCountBanner");
    table.classList.remove("hidden");
    table.classList.add("styled-table");
    const tbody = table.querySelector("tbody");
    const problemIds = Object.keys(currentUser.solvedProblems);
    try {
        const response = await fetch("../Dashboard/problem_data.json");
        const problems = await response.json();
    
        let entries = [];
    
        problemIds.forEach((id) => {
            const problem = problems[id];
            if (!problem) {
              console.log("This problem failed: ", id);
              return;
            }
            const name = problem["Problem Name"];
            const difficulty = problem["Difficulty"];
            const linkURL =
              "https://leetcode.com/problems/" +
              name.replace(/\s+/g, "-").toLowerCase();
            // const companies = localStorage.getItem(`companies-${id}`);
            const date = localStorage.getItem(getUserKey(`date-${id}`)) || "";
            // Store entries for sorting
            entries.push({ id, name, linkURL, difficulty, date });
        
        });
        console.log(entries);
    
        // Sort entries by date in descending order
        
    
        // Update banner with the count of questions solved
        banner.textContent = `Total Questions Solved: ${entries.length}`; // Update the banner with the count
        banner.style.padding = "10px";
        banner.style.marginBottom = "10px";
        banner.style.backgroundColor = "#4A249D";
        banner.style.textAlign = "center";
        banner.style.fontSize = "18px";
        banner.style.fontWeight = "bold";
    
        // Append rows based on sorted entries
        entries.forEach((entry) => {
          const row = tbody.insertRow(-1);
          const cells = [
            row.insertCell(0),
            row.insertCell(1),
            row.insertCell(2),
            row.insertCell(3),
            row.insertCell(4),
          ];
          cells.forEach(
            (cell) => (cell.className = "border px-5 py-2 text-center")
          );
    
          cells[0].textContent = entry.id;
          cells[1].textContent = entry.name;
    
          const link = document.createElement("a");
          link.href = entry.linkURL;
          link.target = "_blank";
          const leetCodeIcon = new Image();
          leetCodeIcon.src = "../Dashboard/leetcode.svg";
          leetCodeIcon.alt = "LeetCode";
          leetCodeIcon.style.height = "30px";
          leetCodeIcon.style.width = "30px";
          link.appendChild(leetCodeIcon);
          cells[2].appendChild(link);
    
          const difficultyTag = document.createElement("span");
          difficultyTag.classList.add("difficulty-tag");
          let diff = entry.difficulty;
    
          if (diff === "Easy") {
            difficultyTag.classList.add("difficulty-easy");
          } else if (diff === "Medium") {
            difficultyTag.classList.add("difficulty-medium");
          } else if (diff === "Hard") {
            difficultyTag.classList.add("difficulty-hard");
          }
    
          difficultyTag.textContent = diff;
          cells[3].appendChild(difficultyTag);
    
          cells[4].textContent = entry.date;
        });
      } catch (error) {
        console.error("Failed to fetch problem data:", error);
        // Swal.fire({
        //   icon: "error",
        //   title: "Fetch Error",
        //   text: "Failed to retrieve problem data.",
        // });
      }
};

window.onload = function() {
    showLoading();
    const username = localStorage.getItem('currentUser');
    currentUser = new User(username);
    
    // Load user data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`${username}-attempt-`)) {
        const problemId = key.split('-')[2];
        const difficulty = localStorage.getItem(`${username}-difficulty-${problemId}`);
        const companiesString = localStorage.getItem(`${username}-companies-${problemId}`);
        const companies = companiesString ? companiesString.split(',') : [];
        const dateString = localStorage.getItem(`${username}-date-${problemId}`);
        
        currentUser.solvedProblems[problemId] = {
          difficulty: difficulty,
          solvedDate: new Date(dateString),
          companies: companies
        };
  
        // Update companyData
        companies.forEach(company => {
          if (!currentUser.companyData[company]) {
            currentUser.companyData[company] = { easy: 0, medium: 0, hard: 0, total: 0 };
          }
          currentUser.companyData[company][difficulty.toLowerCase()]++;
          currentUser.companyData[company].total++;
        });
      }
    }
  
    setTimeout(() => {
      loadUserInfo();
      loadUserStats().then(() => {
        hideLoading();
      
        currentUser.showSummary(); 
      });
    }, 1000);
  };

window.addEventListener('resize', adjustFontSize);

document.getElementById('changePasswordBtn').addEventListener('click', function () {
    const newPassword = prompt("Enter new password:");
    if (newPassword) {
        const username = localStorage.getItem('currentUser');
        let users = JSON.parse(localStorage.getItem('users')) || {};
        users[username] = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        alert("Password changed successfully!");
    }
});
