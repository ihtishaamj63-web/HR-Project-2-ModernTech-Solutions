<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <a class="navbar-brand" href="#"
          ><span class="brand-text">ModernTech <span>Solutions</span></span></a
        >
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
          <div class="mx-auto">
            <ul class="navbar-nav">
              <li class="nav-item">
                <router-link class="nav-link" to="/dashboard"
                  ><i class="bi bi-grid-1x2-fill"></i> Dashboard</router-link
                >
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/employees"
                  ><i class="bi bi-people-fill"></i> Employees</router-link
                >
              </li>
              <li class="nav-item">
                <router-link class="nav-link active" to="/payroll"
                  ><i class="bi bi-wallet2"></i> Payroll</router-link
                >
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/timeoff"
                  ><i class="bi bi-clock-fill"></i> Time Off</router-link
                >
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/attendance"
                  ><i class="bi bi-calendar-check-fill"></i>
                  Attendance</router-link
                >
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/reviews"
                  ><i class="bi bi-star-fill"></i> Review</router-link
                >
              </li>
            </ul>
          </div>
          <div class="d-flex align-items-center gap-3">
            <button
              class="btn btn-toggle"
              @click="toggleNightMode"
              title="Toggle Night Mode"
            >
              <i class="bi bi-moon-fill"></i>
            </button>
            <div class="user-profile">
              <div class="user-avatar">HR</div>
              <div class="user-info">
                <div class="user-name">HR Administrator</div>
                <div class="user-role">Human Resources</div>
              </div>
            </div>
            <button class="btn btn-logout" @click="logout" title="Logout">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Container -->
    <div class="pay-container">
      <h1 class="pay-title">Payroll</h1>
      <p class="pay-date" style="font-size: 14px; color: var(--text-muted)">
        <i class="bi bi-calendar3 me-1"></i> <span>{{ currentDate }}</span>
      </p>

      <!-- Stats Cards -->
      <div class="pay-stats">
        <div class="pay-stat-card">
          <div>
            <div class="pay-stat-label">TOTAL MONTHLY GROSS</div>
            <div class="pay-stat-value">{{ totalGross }}</div>
            <div class="pay-stat-sub">July 2026 projection</div>
          </div>
          <div class="pay-stat-icon"><i class="bi bi-wallet2"></i></div>
        </div>
        <div class="pay-stat-card">
          <div>
            <div class="pay-stat-label">EMPLOYEES ON PAYROLL</div>
            <div class="pay-stat-value">{{ totalCount }}</div>
            <div class="pay-stat-sub">All active contracts</div>
          </div>
          <div class="pay-stat-icon"><i class="bi bi-people-fill"></i></div>
        </div>
        <div class="pay-stat-card">
          <div>
            <div class="pay-stat-label">NEXT PAY DATE</div>
            <div class="pay-stat-value">25 Jul</div>
            <div class="pay-stat-sub">EFT processed automatically</div>
          </div>
          <div class="pay-stat-icon">
            <i class="bi bi-calendar-check-fill"></i>
          </div>
        </div>
      </div>

      <!-- Payroll Card -->
      <div class="pay-card">
        <div class="pay-card-header">
          <div>
            <div class="pay-card-title">June payslip register</div>
            <div class="pay-card-sub">
              Click a row to preview the digital payslip
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center">
            <div class="pay-search-box">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                v-model="searchInput"
                type="text"
                placeholder="Search employee or dept"
                @input="filterPayroll"
              />
            </div>
            <button class="btn btn-outline-primary btn-sm" @click="exportCSV">
              <i class="bi bi-download me-1"></i> Export Excel
            </button>
          </div>
        </div>
        <div class="pay-table-scroll">
          <table class="pay-table">
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>HOURS</th>
                <th>HOURLY</th>
                <th>GROSS</th>
                <th>DEDUCTIONS</th>
                <th>NET PAY</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="employee in filteredEmployees"
                :key="employee.id"
                @click="openPayslip(employee)"
                style="cursor: pointer"
              >
                <td>{{ employee.name }}</td>
                <td>{{ employee.hours }}</td>
                <td>{{ employee.hourly }}</td>
                <td>{{ employee.gross }}</td>
                <td>{{ employee.deductions }}</td>
                <td>{{ employee.netPay }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pay-table-footer">
          <div v-if="filteredEmployees.length > 0">
            Total: {{ filteredEmployees.length }} employees
          </div>
        </div>
      </div>
    </div>

    <!-- Payslip Modal -->
    <div class="pay-modal" v-if="showPayslipModal" @click="closePayslip">
      <div class="pay-modal-card" @click.stop>
        <div class="pay-modal-header">
          <div
            style="font-size: 12px; font-weight: 600; color: var(--text-muted)"
          >
            DIGITAL PAYSLIP
          </div>
          <div style="display: flex; align-items: center; gap: 10px">
            <span class="pay-slip-month">June 2026</span>
            <button class="pay-modal-close" @click="closePayslip">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="16"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="pay-modal-body" v-if="selectedEmployee">
          <div class="payslip-content">
  <h3>{{ selectedEmployee.name }}</h3>

  <p><strong>Hours:</strong> {{ selectedEmployee.hours }}</p>
  <p><strong>Hourly Rate:</strong> {{ selectedEmployee.hourly }}</p>
  <p><strong>Gross Pay:</strong> {{ selectedEmployee.gross }}</p>
  <p>
    <strong>Deductions:</strong> {{ selectedEmployee.deductions }}
  </p>
  <p><strong>Net Pay:</strong> {{ selectedEmployee.netPay }}</p>

  <button
    class="btn btn-primary mt-3"
    @click="downloadPayslipPDF"
  >
    <i class="bi bi-file-earmark-pdf me-2"></i>
    Download Payslip PDF
  </button>
</div>
        </div>
      </div>

    <!-- Toast Notification -->
    <div class="toast-container">
      <div v-if="showToast" class="toast-custom">Payslip updated!</div>
    </div>
  </div>
</template>

<script>
import { jsPDF } from "jspdf";

export default {
  name: "Payroll",
  data() {
    return {
      currentDate: "",
      totalGross: "R0",
      totalCount: 0,
      searchInput: "",
      showPayslipModal: false,
      selectedEmployee: null,
      showToast: false,
      employees: [
        {
          id: 1,
          name: "John Doe",
          hours: 160,
          hourly: "R150",
          gross: "R24,000",
          deductions: "R4,800",
          netPay: "R19,200",
        },
        {
          id: 2,
          name: "Jane Smith",
          hours: 160,
          hourly: "R175",
          gross: "R28,000",
          deductions: "R5,600",
          netPay: "R22,400",
        },
        {
          id: 3,
          name: "Mike Johnson",
          hours: 160,
          hourly: "R200",
          gross: "R32,000",
          deductions: "R6,400",
          netPay: "R25,600",
        },
      ],
    };
  },
  computed: {
    filteredEmployees() {
      if (!this.searchInput) {
        return this.employees;
      }
      const search = this.searchInput.toLowerCase();
      return this.employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(search) ||
          employee.id.toString().includes(search),
      );
    },
  },
  methods: {
    openPayslip(employee) {
      this.selectedEmployee = employee;
      this.showPayslipModal = true;
    },
    closePayslip() {
      this.showPayslipModal = false;
      this.selectedEmployee = null;
    },

    downloadPayslipPDF() {
  if (!this.selectedEmployee) {
    return;
  }

  const employee = this.selectedEmployee;

  const doc = new jsPDF();

  // Company heading
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ModernTech Solutions", 105, 25, {
    align: "center",
  });

  // Payslip title
  doc.setFontSize(16);
  doc.text("PAYSLIP", 105, 40, {
    align: "center",
  });

  // Month
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Pay Period: June 2026", 105, 50, {
    align: "center",
  });

  // Line
  doc.line(20, 60, 190, 60);

  // Employee information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Employee Information", 20, 75);

  doc.setFont("helvetica", "normal");
  doc.text(`Employee Name: ${employee.name}`, 20, 88);
  doc.text(`Employee ID: ${employee.id}`, 20, 98);

  // Payroll information
  doc.setFont("helvetica", "bold");
  doc.text("Payroll Details", 20, 118);

  doc.setFont("helvetica", "normal");
  doc.text(`Hours Worked: ${employee.hours}`, 20, 132);
  doc.text(`Hourly Rate: ${employee.hourly}`, 20, 142);
  doc.text(`Gross Pay: ${employee.gross}`, 20, 152);
  doc.text(`Deductions: ${employee.deductions}`, 20, 162);

  // Net pay
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`NET PAY: ${employee.netPay}`, 20, 180);

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This payslip was generated electronically by ModernTech Solutions.",
    105,
    270,
    { align: "center" }
  );

  // Download
  const fileName = `${employee.name.replace(/\s+/g, "_")}_Payslip_June_2026.pdf`;

  doc.save(fileName);

  this.displayToast();
},
    filterPayroll() {
      // Filter is handled by computed property
    },
    exportCSV() {
      const csv = this.convertToCSV(this.filteredEmployees);
      this.downloadCSV(csv, "payroll.csv");
      this.displayToast();
    },
    convertToCSV(data) {
      const headers = [
        "EMPLOYEE",
        "HOURS",
        "HOURLY",
        "GROSS",
        "DEDUCTIONS",
        "NET PAY",
      ];
      const rows = data.map((employee) => [
        employee.name,
        employee.hours,
        employee.hourly,
        employee.gross,
        employee.deductions,
        employee.netPay,
      ]);

      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n",
      );

      return csv;
    },
    downloadCSV(csv, filename) {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    toggleNightMode() {
      const body = document.body;
      body.classList.toggle("dark-mode");
    },
    logout() {
      this.$router.push("/login");
    },
    displayToast() {
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    updateDate() {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      this.currentDate = new Date().toLocaleDateString("en-US", options);
    },
    calculateTotals() {
      this.totalCount = this.employees.length;
      // Parse and sum gross values
      const totalGrossValue = this.employees.reduce((sum, emp) => {
        const value = parseInt(emp.gross.replace(/[^\d]/g, ""));
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
      this.totalGross = `R${totalGrossValue.toLocaleString()}`;
    },
  },
  mounted() {
    this.updateDate();
    this.calculateTotals();
  },
};
</script>

<style scoped>
/* Navbar Styles */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-text {
  color: white;
}

.brand-text span {
  color: #fbbf24;
}

.navbar-nav .nav-link {
  color: rgba(255, 255, 255, 0.8) !important;
  transition: all 0.3s ease;
}

.navbar-nav .nav-link:hover,
.navbar-nav .nav-link.active {
  color: white !important;
}

.navbar-nav .nav-link i {
  margin-right: 0.5rem;
}

.btn-toggle {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.btn-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: #fbbf24;
  color: #1f2937;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.user-role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Main Container */
.pay-container {
  padding: 2rem;
  background: var(--bg-primary, #f8f9fa);
  min-height: calc(100vh - 70px);
}

.pay-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #1f2937);
}

.pay-date {
  margin-bottom: 2rem;
  color: var(--text-muted, #6b7280);
}

/* Stats Cards */
.pay-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.pay-stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.pay-stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.pay-stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pay-stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #667eea;
  margin: 0.5rem 0;
}

.pay-stat-sub {
  font-size: 0.875rem;
  color: var(--text-muted, #6b7280);
}

.pay-stat-icon {
  font-size: 2.5rem;
  color: #667eea;
  opacity: 0.2;
}

/* Payroll Card */
.pay-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pay-card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pay-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin-bottom: 0.25rem;
}

.pay-card-sub {
  font-size: 0.875rem;
  color: var(--text-muted, #6b7280);
}

.pay-search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #e5e7eb);
}

.pay-search-box svg {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-muted, #6b7280);
}

.pay-search-box input {
  border: none;
  background: transparent;
  outline: none;
  width: 200px;
  font-size: 0.875rem;
}

/* Table Styles */
.pay-table-scroll {
  overflow-x: auto;
}

.pay-table {
  width: 100%;
  border-collapse: collapse;
}

.pay-table thead {
  background: var(--bg-secondary, #f3f4f6);
  border-bottom: 2px solid var(--border-color, #e5e7eb);
}

.pay-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pay-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  font-size: 0.875rem;
  color: var(--text-primary, #1f2937);
}

.pay-table tbody tr {
  transition: all 0.3s ease;
}

.pay-table tbody tr:hover {
  background: var(--bg-secondary, #f3f4f6);
}

.pay-table-footer {
  padding: 1rem;
  text-align: right;
  font-size: 0.875rem;
  color: var(--text-muted, #6b7280);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

/* Modal Styles */
.pay-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}

.pay-modal-card {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.pay-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pay-slip-month {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.pay-modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted, #6b7280);
  transition: all 0.3s ease;
}

.pay-modal-close:hover {
  color: var(--text-primary, #1f2937);
}

.pay-modal-body {
  padding: 1.5rem;
}

.payslip-content {
  font-size: 0.875rem;
  line-height: 1.6;
}

.payslip-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary, #1f2937);
}

.payslip-content p {
  margin-bottom: 0.75rem;
  color: var(--text-primary, #1f2937);
}

/* Toast Notification */
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1001;
}

.toast-custom {
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .pay-container {
    padding: 1rem;
  }

  .pay-title {
    font-size: 1.5rem;
  }

  .pay-stats {
    grid-template-columns: 1fr;
  }

  .pay-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .pay-search-box input {
    width: 100%;
  }

  .pay-table {
    font-size: 0.75rem;
  }

  .pay-table th,
  .pay-table td {
    padding: 0.75rem 0.5rem;
  }
}

/* Dark Mode */
:root {
  --bg-primary: #f8f9fa;
  --bg-secondary: #f3f4f6;
  --text-primary: #1f2937;
  --text-muted: #6b7280;
  --border-color: #e5e7eb;
}

.dark-mode {
  --bg-primary: #1f2937;
  --bg-secondary: #374151;
  --text-primary: #f3f4f6;
  --text-muted: #d1d5db;
  --border-color: #4b5563;
}

.dark-mode .pay-container {
  background: var(--bg-primary);
}

.dark-mode .pay-card,
.dark-mode .pay-stat-card,
.dark-mode .pay-modal-card {
  background: var(--bg-secondary);
}
</style>
