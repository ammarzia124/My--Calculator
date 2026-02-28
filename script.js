class Calculator {
  constructor() {
    // State
    this.currentValue = '0';
    this.previousValue = null;
    this.operator = null;
    this.waitingForNewNumber = false;
    this.equation = '';
    this.history = [];

    // DOM elements
    this.currentDisplay = document.getElementById('current');
    this.equationDisplay = document.getElementById('equation');
    this.historyPanel = document.getElementById('history');
    this.historyList = document.getElementById('historyList');

    // Initialize
    this.setupEventListeners();
    this.updateDisplay();
  }

  setupEventListeners() {
    // Number buttons
    document.querySelectorAll('[data-number]').forEach(btn => {
      btn.addEventListener('click', () => this.addNumber(btn.dataset.number));
    });

    // Decimal button
    document.querySelector('[data-decimal]').addEventListener('click', () => this.addDecimal());

    // Operator buttons
    document.querySelectorAll('[data-operator]').forEach(btn => {
      btn.addEventListener('click', () => this.addOperator(btn.dataset.operator));
    });

    // Equals button
    document.getElementById('equals').addEventListener('click', () => this.calculate());

    // Clear buttons
    document.getElementById('clear').addEventListener('click', () => this.clear());
    document.getElementById('clearEntry').addEventListener('click', () => this.clearEntry());

    // Backspace
    document.getElementById('backspace').addEventListener('click', () => this.backspace());

    // History
    document.getElementById('historyBtn').addEventListener('click', () => this.toggleHistory());
    document.getElementById('closeHistory').addEventListener('click', () => this.toggleHistory(false));

    // Keyboard support
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  addNumber(num) {
    if (this.waitingForNewNumber) {
      this.currentValue = num;
      this.waitingForNewNumber = false;
    } else {
      if (this.currentValue === '0') {
        this.currentValue = num;
      } else {
        if (this.currentValue.replace('.', '').length < 15) {
          this.currentValue += num;
        }
      }
    }
    this.updateDisplay();
  }

  addDecimal() {
    if (this.waitingForNewNumber) {
      this.currentValue = '0.';
      this.waitingForNewNumber = false;
    } else if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
    }
    this.updateDisplay();
  }

  addOperator(op) {
    if (this.operator && !this.waitingForNewNumber) {
      this.calculate();
    }
    
    this.previousValue = this.currentValue;
    this.operator = op;
    this.waitingForNewNumber = true;
    
    this.equation = `${this.formatNumber(this.previousValue)} ${this.getOperatorSymbol(op)}`;
    this.updateDisplay();
  }

  calculate() {
    if (!this.operator || !this.previousValue || this.waitingForNewNumber) return;

    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.currentValue);
    let result;

    // Perform calculation
    switch (this.operator) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/': 
        if (current === 0) {
          this.showError();
          return;
        }
        result = prev / current; 
        break;
      default: return;
    }

    // Fix floating point precision
    result = Math.round(result * 1e12) / 1e12;
    
    // Create equation string for history
    const equationStr = `${this.formatNumber(prev)} ${this.getOperatorSymbol(this.operator)} ${this.formatNumber(current)} = ${this.formatNumber(result)}`;
    
    // Add to history
    this.addToHistory(equationStr);
    
    // Update state
    this.currentValue = result.toString();
    this.equation = equationStr;
    this.previousValue = null;
    this.operator = null;
    this.waitingForNewNumber = true;
    
    this.updateDisplay();
  }

  clear() {
    this.currentValue = '0';
    this.previousValue = null;
    this.operator = null;
    this.waitingForNewNumber = false;
    this.equation = '';
    this.updateDisplay();
  }

  clearEntry() {
    this.currentValue = '0';
    this.updateDisplay();
  }

  backspace() {
    if (this.waitingForNewNumber || this.currentValue === 'Error') return;
    
    if (this.currentValue.length > 1) {
      this.currentValue = this.currentValue.slice(0, -1);
    } else {
      this.currentValue = '0';
    }
    this.updateDisplay();
  }

  showError() {
    this.currentValue = 'Error';
    this.equation = 'Division by zero';
    this.previousValue = null;
    this.operator = null;
    this.waitingForNewNumber = true;
    this.updateDisplay();
  }

  addToHistory(entry) {
    this.history.unshift(entry);
    if (this.history.length > 5) {
      this.history.pop();
    }
    this.renderHistory();
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
      return;
    }
    
    this.historyList.innerHTML = this.history
      .map(item => `<div class="history-item">${item}</div>`)
      .join('');
  }

  toggleHistory(show) {
    if (show === undefined) {
      this.historyPanel.classList.toggle('show');
    } else if (show) {
      this.historyPanel.classList.add('show');
    } else {
      this.historyPanel.classList.remove('show');
    }
  }

  formatNumber(num) {
    if (num === 'Error') return 'Error';
    const n = parseFloat(num);
    if (isNaN(n)) return '0';
    
    // Remove trailing zeros
    return n.toString();
  }

  getOperatorSymbol(op) {
    const symbols = {
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷'
    };
    return symbols[op] || op;
  }

  updateDisplay() {
    this.currentDisplay.textContent = this.currentValue;
    this.equationDisplay.textContent = this.equation;
  }

  handleKeyboard(e) {
    const key = e.key;
    
    // Prevent default for calculator keys
    if (key.match(/^[0-9]$|\.|[+\-*/=]|Enter|Backspace|Escape|Delete/)) {
      e.preventDefault();
    }

    // Numbers
    if (/^[0-9]$/.test(key)) {
      this.addNumber(key);
    }
    // Decimal
    else if (key === '.') {
      this.addDecimal();
    }
    // Operators
    else if (key === '+') {
      this.addOperator('+');
    }
    else if (key === '-') {
      this.addOperator('-');
    }
    else if (key === '*' || key === 'x') {
      this.addOperator('*');
    }
    else if (key === '/') {
      this.addOperator('/');
    }
    // Equals
    else if (key === 'Enter' || key === '=') {
      this.calculate();
    }
    // Backspace
    else if (key === 'Backspace') {
      this.backspace();
    }
    // Clear
    else if (key === 'Escape') {
      this.clear();
    }
    else if (key === 'Delete') {
      this.clearEntry();
    }
  }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});