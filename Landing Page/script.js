function showSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'flex'
  }
  function hideSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'none'
  }


const codeDisplay = document.getElementById('code-display');
const codeContainer = document.querySelector('.code-container');
const codeLines = [
    'public class FactorialCalculator {',
    '    int FactorialCalculator() {',
    '        int number = 5;',
    '        long fact = 1;',
    '        for(int i = 1; i <= number; i++){',
    '            fact = fact * i;',
    '        }',
    '        return fact;',
    '    }',
    ' ',
    '    public static void main(String[] args) {',
    '        int number = 5;',
    '        long fact = 1;',
    '        FactorialCalculator fact = new FactorialCalculator();',
    '        System.out.println("Factorial of "+number+" is: " + fact);',
    '    }',
    '}'
];

function createLineNumbers(count) {
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers';
    for (let i = 1; i <= count; i++) {
        lineNumbers.innerHTML += i + '<br>';
    }
    codeContainer.insertBefore(lineNumbers, codeContainer.firstChild);
}

function typeCode(lines, currentLine = 0, currentChar = 0) {
    if (currentLine === lines.length) {
        setTimeout(startAnimation, 2000); // Wait 2 seconds before restarting
        return;
    }
    if (currentChar < lines[currentLine].length) {
        codeDisplay.innerHTML += lines[currentLine][currentChar];
        setTimeout(() => typeCode(lines, currentLine, currentChar + 1), 25);
    } else {
        codeDisplay.innerHTML += '<br>';
        setTimeout(() => typeCode(lines, currentLine + 1, 0), 250);
    }
}

function highlightSyntax(code) {
    return code
        .replace(/\b(public|class|int|long|for|return|void|static|new)\b/g, '<span class="keyword">$1</span>')
        .replace(/\b(FactorialCalculator|String|System)\b/g, '<span class="type">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
        .replace(/"([^"]*)"/, '<span class="string">"$1"</span>');
}

function startAnimation() {
    codeDisplay.innerHTML = ''; // Clear previous content
    typeCode(codeLines);
    
    // Apply syntax highlighting after animation
    setTimeout(() => {
        codeDisplay.innerHTML = highlightSyntax(codeDisplay.innerHTML);
    }, (codeLines.join('').length * 25) + (codeLines.length * 250));
}

createLineNumbers(19);  // Create line numbers for 16 lines
startAnimation();  // Start the initial animation

// login-signup
function openModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    signupForm.style.display = signupForm.style.display === 'none' ? 'block' : 'none';
}

// Global variable to store the currently logged-in username
let currentUser = null;

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[username] && users[username] === password) {
        currentUser = username; // Set the logged-in user
        localStorage.setItem('currentUser', username); // Store current user in localStorage
        window.location.href = '../Dashboard/dashboard.html'; // Redirect to dashboard
        closeModal();
        updateAuthButton();
    } else {
        alert('Invalid username or password');
    }
}
function getUserSpecificStorageKey(username, key) {
    return `${username}-${key}`;
}

function signup() {
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    let users = JSON.parse(localStorage.getItem('users')) || {};
    let currentDate = new Date().toJSON().slice(0, 10);

    if (users[username]) {
        alert('Username already exists');
    } else {
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Store the user's specific join date using the username
        localStorage.setItem(username+'joinDate', currentDate);
        console.log(localStorage.getItem(username + 'joinDate'))
        alert('Signup successful! Please login.');
        toggleForm();
    }
}
function checkLoginAndRedirect(page) {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        redirectToPage(page);
    } else {
        localStorage.setItem('lastAttemptedPage', page);
        openModal();
    }
}

// Function to handle redirection
function redirectToPage(page) {
    switch(page) {
        case 'home':
            window.location.href = '/';
            break;
        case 'practice':
            window.location.href = '/practice';
            break;
        case 'submit':
            window.location.href = '/contribute';
            break;
        case 'dsa-roadmap':
            window.location.href = '/dsa-roadmap';
            break;
        case 'profile':
            window.location.href = '/profile';
            break;
        default:
            window.location.href = '../Dashboard/dashboard.html';
    }
}
function logout() {
    // Clear the current user from localStorage
    localStorage.removeItem('currentUser');
    updateAuthButton();
    // Redirect to the login page or home page
    window.location.href = "../Landing Page/index.html"; 
  }

// Load the logged-in user when the page is loaded
window.onload = function () {
    currentUser = localStorage.getItem('currentUser');
    console.log(currentUser);
    updateAuthButton();
};
// if(currentUser!=null){
//     const loginbtn = document.getElementsByClassName('loginbtn');
//     loginbtn.innerHTML="Log Out";
//     loginbtn.onclick(logout());
   
// }
function updateAuthButton() {
    console.log(currentUser);
    const authButtons = document.getElementsByClassName('loginbtn');
   
    const buttonConfig = currentUser != null
        ? { text: "Log Out", action: logout }
        : { text: "Join Us", action: openModal };

    Array.from(authButtons).forEach(button => {
        button.textContent = buttonConfig.text;
        button.onclick = buttonConfig.action;
    });
}


//section : Road Map

const milestones = [
    {
        id: 'milestone1',
        title: 'LANGUAGE',
        description: 'Choose a Programming Language that suits your purpose',
        details: 'Consider factors like ease of learning, job market demand, and your specific goals (web development, data science, etc.) when choosing a language.'
    },
    {
        id: 'milestone2',
        title: 'FUNDAMENTALS',
        description: 'Learn the fundamental syntaxes and data structures',
        details: 'Master basic concepts like variables, loops, conditionals, functions, and common data structures (arrays, lists, dictionaries).'
    },
    {
        id: 'milestone3',
        title: 'PRACTICE',
        description: 'Practice all kinds of algorithms on different platforms',
        details: 'Solve problems on platforms like LeetCode, HackerRank, or CodeWars. Focus on implementing various algorithms and improving your problem-solving skills.'
    },
    {
        id: 'milestone4',
        title: 'COMPETE',
        description: 'Apply logical skills and advance by challenging others',
        details: 'Participate in coding competitions, hackathons, or contribute to open-source projects to apply your skills in real-world scenarios.'
    }
];

function initializeMilestones() {
    milestones.forEach(milestone => {
        const element = document.getElementById(milestone.id);
        const info = document.createElement('div');
        info.className = 'milestone-info';
        info.innerHTML = `
            <h3>${milestone.title}</h3>
            <p>${milestone.description}</p>
        `;
        document.querySelector('.roadSection').appendChild(info);

        const updateInfoPosition = () => {
            const rect = element.getBoundingClientRect();
            const roadSection = document.querySelector('.roadSection');
            const roadRect = roadSection.getBoundingClientRect();
            
            let left = rect.left + rect.width / 2 - 100 - roadRect.left;
            let top = rect.top - 100 - roadRect.top;

            left = Math.max(10, Math.min(left, roadRect.width - 210));
            top = Math.max(10, Math.min(top, roadRect.height - info.offsetHeight - 10));

            info.style.left = `${left}px`;
            info.style.top = `${top}px`;
        };

        window.addEventListener('resize', updateInfoPosition);

        let timeout;
        element.addEventListener('mouseenter', () => {
            clearTimeout(timeout);
            updateInfoPosition();
            info.style.opacity = '1';
            info.style.transform = 'translateY(0)';
        });

        element.addEventListener('mouseleave', () => {
            timeout = setTimeout(() => {
                info.style.opacity = '0';
                info.style.transform = 'translateY(10px)';
            }, 300);
        });

        element.addEventListener('click', () => {
            showModal(milestone);
        });
    });
}

function showModal(milestone) {
    const roadModal = document.getElementById('roadmodal');
    const roadModalTitle = document.getElementById('road-modalTitle');
    const roadModalDescription = document.getElementById('road-modalDescription');
    const roadModalDetails = document.getElementById('road-modalDetails');

    roadModalTitle.textContent = milestone.title;
    roadModalDescription.textContent = milestone.description;
    roadModalDetails.textContent = milestone.details;
    roadModal.style.display = 'block';
}

const closeBtn = document.querySelector('.close');
closeBtn.onclick = function() {
    document.getElementById('roadmodal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('roadmodal')) {
        document.getElementById('roadmodal').style.display = 'none';
    }
}

function animateRoadmap() {
    const roadSection = document.querySelector('.roadSection');
    const bigHeading = roadSection.querySelector('.bigHeading');
    const road = roadSection.querySelector('.road');
    const milestones = roadSection.querySelectorAll('.milestone');

    bigHeading.classList.add('visible');
    road.classList.add('visible');
    milestones.forEach(milestone => milestone.classList.add('visible'));
}

function checkRoadmapVisibility() {
    const roadSection = document.querySelector('.roadSection');
    const rect = roadSection.getBoundingClientRect();
    const isVisible = (rect.top <= window.innerHeight && rect.bottom >= 0);
    
    if (isVisible) {
        animateRoadmap();
    } else {
        // Reset animations when out of view
        const bigHeading = roadSection.querySelector('.bigHeading');
        const road = roadSection.querySelector('.road');
        const milestones = roadSection.querySelectorAll('.milestone');

        bigHeading.classList.remove('visible');
        road.classList.remove('visible');
        milestones.forEach(milestone => milestone.classList.remove('visible'));
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initializeMilestones();
    checkRoadmapVisibility(); // Check initial visibility
    window.addEventListener('scroll', checkRoadmapVisibility);
});

// Animate the big heading
const bigHeading = document.querySelector('.bigHeading');
bigHeading.innerHTML = bigHeading.textContent.replace(/\S/g, "<span>$&</span>");

const letters = document.querySelectorAll('.bigHeading span');
letters.forEach((letter, index) => {
    letter.style.animationDelay = `${index * 0.1}s`;
});



document.addEventListener('load', updateAuthButton);
