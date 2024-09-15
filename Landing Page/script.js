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

