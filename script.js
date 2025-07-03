// DOM Elements
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const subcategoryInput = document.getElementById("subcategory");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const monthFilter = document.getElementById("month");
const yearFilter = document.getElementById("year");

// Data
let expenses = [];

// Chart.js Setup
const ctx = document.getElementById("expense-chart").getContext("2d");

let expenseChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: [],
    datasets: [{
      label: "Expenses by Category",
      data: [],
      backgroundColor: [
        "#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0", "#795548"
      ],
      borderWidth: 1,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom"
      }
    }
  }
});

// Save to LocalStorage
function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Load on page load
window.addEventListener("load", () => {
  const data = localStorage.getItem("expenses");
  if (data) {
    expenses = JSON.parse(data);
  }
  populateYearFilter();
  renderExpenses();
  updateTotal();
  updateChart();
});

// Handle form submit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const subcategory = subcategoryInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;

  if (!title || !category || isNaN(amount) || !date) {
    alert("Please fill all required fields");
    return;
  }

  const expense = {
    id: Date.now(),
    title,
    category,
    subcategory,
    amount,
    date
  };

  expenses.push(expense);
  saveToLocalStorage();
  populateYearFilter();
  renderExpenses();
  updateTotal();
  updateChart();
  form.reset();
});

// Render filtered expenses
function renderExpenses() {
  expenseList.innerHTML = "";

  const filtered = getFilteredExpenses();

  filtered.forEach(exp => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${exp.title}</strong> (${exp.category} - ${exp.subcategory || "N/A"}) <br>
        ₹${exp.amount.toFixed(2)} - <small>${exp.date}</small>
      </div>
      <button onclick="deleteExpense(${exp.id})">X</button>
    `;

    expenseList.appendChild(li);
  });
}

// Update total based on filtered data
function updateTotal() {
  const filtered = getFilteredExpenses();
  const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
  totalDisplay.textContent = total.toFixed(2);
}

// Delete expense
function deleteExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  saveToLocalStorage();
  populateYearFilter();
  renderExpenses();
  updateTotal();
  updateChart();
}

// Update chart by category
function updateChart() {
  const filtered = getFilteredExpenses();
  const categoryTotals = {};

  filtered.forEach(exp => {
    if (categoryTotals[exp.category]) {
      categoryTotals[exp.category] += exp.amount;
    } else {
      categoryTotals[exp.category] = exp.amount;
    }
  });

  expenseChart.data.labels = Object.keys(categoryTotals);
  expenseChart.data.datasets[0].data = Object.values(categoryTotals);
  expenseChart.update();
}

// Return expenses filtered by month/year
function getFilteredExpenses() {
  const month = monthFilter.value;
  const year = yearFilter.value;

  return expenses.filter(exp => {
    const [expYear, expMonth] = exp.date.split("-");

    const monthMatch = (month === "all" || expMonth === month);
    const yearMatch = (year === "all" || expYear === year);

    return monthMatch && yearMatch;
  });
}

// Populate year dropdown
function populateYearFilter() {
  const years = [...new Set(expenses.map(exp => exp.date.split("-")[0]))];
  yearFilter.innerHTML = '<option value="all">All</option>';
  years.sort().forEach(y => {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearFilter.appendChild(option);
  });
}

// Filter dropdown events
monthFilter.addEventListener("change", () => {
  renderExpenses();
  updateTotal();
  updateChart();
});

yearFilter.addEventListener("change", () => {
  renderExpenses();
  updateTotal();
  updateChart();
});
document.getElementById("export-btn").addEventListener("click", () => {
  const filtered = getFilteredExpenses();

  if (filtered.length === 0) {
    alert("No expenses to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Title,Category,Subcategory,Amount,Date\n";

  filtered.forEach(exp => {
    csvContent += `${exp.title},${exp.category},${exp.subcategory},${exp.amount},${exp.date}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "expenses.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
// Theme Toggle
const themeSwitch = document.getElementById("theme-switch");

// Load saved theme
window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeSwitch.checked = true;
  }
});

// Toggle theme on checkbox change
themeSwitch.addEventListener("change", () => {
  if (themeSwitch.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});


