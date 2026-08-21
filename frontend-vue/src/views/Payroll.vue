<template>
  <div class="pay-container">
    <h1 class="pay-title">Payroll</h1>
    <p class="pay-date"><i class="bi bi-calendar3 me-1"></i> {{ today }}</p>

    <div class="pay-stats">
      <div class="pay-stat-card">
        <div>
          <div class="pay-stat-label">TOTAL MONTHLY GROSS</div>
          <div class="pay-stat-value">{{ formatCurrency(totalGross) }}</div>
          <div class="pay-stat-sub">July 2026 projection</div>
        </div>
        <div class="pay-stat-icon"><i class="bi bi-wallet2"></i></div>
      </div>
      <div class="pay-stat-card">
        <div>
          <div class="pay-stat-label">EMPLOYEES ON PAYROLL</div>
          <div class="pay-stat-value">{{ payroll.length }}</div>
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

    <div class="pay-card">
      <div class="pay-card-header">
        <div>
          <div class="pay-card-title">June payslip register</div>
          <div class="pay-card-sub">
            {{
              isHR
                ? "Click a row to preview the digital payslip"
                : "Your payslip - click to view details"
            }}
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center">
          <div class="pay-search-box">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              v-model="search"
              placeholder="Search employee or dept"
            />
          </div>
          <button
            class="btn btn-outline-primary btn-sm"
            @click="exportCSV"
            v-if="isHR"
          >
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
            <tr v-if="loading">
              <td colspan="6" class="text-center py-5">
                <div
                  class="spinner-border text-primary"
                  style="width: 3rem; height: 3rem"
                  role="status"
                >
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr
              v-for="p in paginatedPayroll"
              :key="p.emp_id"
              @click="openPayslip(p.emp_id)"
              style="cursor: pointer"
            >
              <td>
                <div class="pay-slip-emp">
                  <div class="pay-slip-avatar" :style="{ background: p.color }">
                    {{ getInitials(p.name) }}
                  </div>
                  <div>
                    <div class="pay-emp-name">{{ p.name }}</div>
                    <div class="pay-emp-id">{{ p.id }} · {{ p.position }}</div>
                    <span class="pay-dept-tag">{{ p.department }}</span>
                  </div>
                </div>
              </td>
              <td>{{ p.hoursWorked }}h</td>
              <td>{{ formatCurrency(p.hourlyRate) }}</td>
              <td>{{ formatCurrency(p.gross) }}</td>
              <td>- {{ formatCurrency(p.deductions) }}</td>
              <td class="pay-net-cell">{{ formatCurrency(p.net) }}</td>
            </tr>
            <tr v-if="!loading && paginatedPayroll.length === 0">
              <td
                colspan="6"
                style="text-align: center; color: #5a5a7a; padding: 20px"
              >
                No payslips found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pay-table-footer">
        <span
          >Showing {{ paginatedPayroll.length }} of
          {{ filteredPayroll.length }} payslips</span
        >
        <div class="pagination-controls">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Prev
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <div
      class="pay-modal"
      :class="{ open: showModal }"
      @click="closeModalIfOutside"
    >
      <div class="pay-modal-card">
        <div class="pay-modal-header">
          <div style="font-size: 12px; font-weight: 600; color: #5a5a7a">
            DIGITAL PAYSLIP
          </div>
          <div style="display: flex; align-items: center; gap: 10px">
            <span class="pay-slip-month">June 2026</span>
            <button class="pay-modal-close" @click="showModal = false">
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
        <div class="pay-modal-body" v-if="selectedPayslip">
          <div class="pay-slip-emp">
            <div
              class="pay-slip-avatar"
              :style="{ background: selectedPayslip.color }"
            >
              {{ getInitials(selectedPayslip.name) }}
            </div>
            <div>
              <div style="font-weight: 700; color: #1a1a2e">
                {{ selectedPayslip.name }}
              </div>
              <div style="font-size: 12px; color: #5a5a7a">
                {{ selectedPayslip.position }} · {{ selectedPayslip.id }} ·
                {{ selectedPayslip.department }}
              </div>
            </div>
          </div>
          <div class="pay-row">
            <span>Hours worked</span
            ><span>{{ selectedPayslip.hoursWorked }}h</span>
          </div>
          <div class="pay-row">
            <span>Hourly rate</span
            ><span>{{ formatCurrency(selectedPayslip.hourlyRate) }}</span>
          </div>
          <div class="pay-row">
            <span>Gross pay</span
            ><span>{{ formatCurrency(selectedPayslip.gross) }}</span>
          </div>
          <div class="pay-row">
            <span>Tax ({{ Math.round(selectedPayslip.taxRate * 100) }}%)</span
            ><span>- {{ formatCurrency(selectedPayslip.deductions) }}</span>
          </div>
          <div class="pay-net-bar">
            <div>
              <div style="font-size: 12px; opacity: 0.8">Net pay</div>
              <div style="font-size: 20px; font-weight: 700">
                {{ formatCurrency(selectedPayslip.net) }}
              </div>
            </div>
          </div>
          <button
            class="btn btn-primary w-100 mt-4"
            @click="downloadPayslipPDF"
          >
            <i class="bi bi-file-earmark-pdf me-2"></i> Download Payslip PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "../stores/auth";
import api from "../api/axios";
import { jsPDF } from "jspdf";

const { isHR, state } = useAuth();

const payroll = ref([]);
const search = ref("");
const showModal = ref(false);
const selectedPayslip = ref(null);
const loading = ref(false);
const today = new Date().toLocaleDateString("en-ZA", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const currentPage = ref(1);
const itemsPerPage = 10;

const filteredPayroll = computed(() => {
  if (!search.value) return payroll.value;
  const q = search.value.toLowerCase();
  return payroll.value.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q),
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredPayroll.value.length / itemsPerPage),
);
const paginatedPayroll = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPayroll.value.slice(start, end);
});

const totalGross = computed(() =>
  payroll.value.reduce((sum, p) => sum + p.gross, 0),
);

function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("");
}
function formatCurrency(value) {
  return "R " + Number(value).toLocaleString("en-ZA");
}
function getDepartmentColor(dept) {
  const colors = {
    Development: "#4CAF50",
    HR: "#2196F3",
    QA: "#FF9800",
    Sales: "#E74C5E",
    Marketing: "#9C27B0",
    Design: "#00BCD4",
    IT: "#607D8B",
    Finance: "#795548",
    Support: "#3F51B5",
  };
  return colors[dept] || "#8686AC";
}

function openPayslip(empId) {
  const p = payroll.value.find((x) => x.emp_id === empId);
  if (p) {
    selectedPayslip.value = p;
    showModal.value = true;
  }
}
function closeModalIfOutside(e) {
  if (e.target === e.currentTarget) showModal.value = false;
}

function downloadPayslipPDF() {
  if (!selectedPayslip.value) return;
  const emp = selectedPayslip.value;
  const doc = new jsPDF();
  const primaryColor = [15, 14, 71];
  const accentColor = [15, 110, 110];
  const lightGray = [240, 242, 247];
  const borderColor = [216, 220, 230];
  const textColor = [26, 26, 46];

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ModernTech Solutions", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("PAYSLIP", 15, 25);
  doc.text("Pay Period: June 2026", 195, 25, { align: "right" });

  let y = 50;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Employee Details", 15, y);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(15, y + 2, 195, y + 2);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${emp.name}`, 15, y);
  doc.text(`Employee ID: ${emp.id}`, 105, y);
  y += 7;
  doc.text(`Department: ${emp.department}`, 15, y);
  doc.text(`Position: ${emp.position}`, 105, y);

  y += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Earnings & Deductions", 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 10;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(15, y - 5, 180, 8, "F");
  doc.setFontSize(10);
  doc.text("Description", 17, y);
  doc.text("Amount", 193, y, { align: "right" });

  y += 10;
  doc.setFont("helvetica", "normal");
  const drawRow = (label, value, isBold = false) => {
    if (isBold) doc.setFont("helvetica", "bold");
    doc.text(label, 17, y);
    doc.text(value, 193, y, { align: "right" });
    doc.setDrawColor(230, 230, 230);
    doc.line(15, y + 2, 195, y + 2);
    y += 10;
    if (isBold) doc.setFont("helvetica", "normal");
  };
  drawRow("Basic Salary", formatCurrency(emp.gross));
  drawRow("Hours Worked", `${emp.hoursWorked} hrs`);
  drawRow("Hourly Rate", formatCurrency(emp.hourlyRate));
  drawRow(
    `Tax Deductions (${Math.round(emp.taxRate * 100)}%)`,
    `- ${formatCurrency(emp.deductions)}`,
  );

  y += 5;
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(15, y, 180, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("NET PAY", 17, y + 10);
  doc.text(formatCurrency(emp.net), 193, y + 10, { align: "right" });

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This is a computer-generated payslip and does not require a signature.",
    105,
    285,
    { align: "center" },
  );
  doc.text("ModernTech Solutions HR Department | Confidential", 105, 290, {
    align: "center",
  });

  const fileName = `${emp.name.replace(/\s+/g, "_")}_Payslip_June_2026.pdf`;
  doc.save(fileName);
  showToast("Payslip PDF downloaded successfully", "success");
}

function exportCSV() {
  if (!isHR.value)
    return showToast("Only HR staff can export payroll data.", "danger");
  try {
    const headers = [
      "Employee Name",
      "ID",
      "Department",
      "Position",
      "Hours Worked",
      "Hourly Rate",
      "Gross Pay",
      "Deductions",
      "Net Pay",
    ];
    const rows = filteredPayroll.value.map((p) => [
      `"${p.name}"`,
      `"${p.id}"`,
      `"${p.department}"`,
      `"${p.position}"`,
      p.hoursWorked,
      p.hourlyRate.toFixed(2),
      p.gross.toFixed(2),
      p.deductions.toFixed(2),
      p.net.toFixed(2),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    link.download = `payroll_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showToast("Payroll exported successfully", "success");
  } catch (error) {
    console.error("Export error:", error);
    showToast("Failed to export payroll", "danger");
  }
}

function showToast(message, type) {
  if (window.showToast) window.showToast(message, type);
  else alert(message);
}

async function loadPayroll() {
  loading.value = true;
  try {
    const empResponse = await api.get("/employees");
    const payResponse = await api.get("/payroll");
    if (empResponse.data.success && payResponse.data.success) {
      const employees = empResponse.data.data;
      const payrollData = payResponse.data.data;
      const loggedInEmail = state.user?.email;
      const visibleEmployees = isHR.value
        ? employees
        : employees.filter((e) => e.email === loggedInEmail);
      payroll.value = visibleEmployees.map((emp) => {
        const existing = payrollData.find((p) => p.emp_id === emp.emp_id);
        const name =
          `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Unknown";
        if (existing) {
          const baseSalary = parseFloat(existing.base_salary);
          const taxRate = parseFloat(existing.tax_rate) / 100;
          const gross = baseSalary;
          const tax = gross * taxRate;
          const net = gross - tax;
          return {
            ...emp,
            name,
            id: "MT-" + String(emp.emp_id).padStart(3, "0"),
            hoursWorked: 160,
            hourlyRate: Math.round(baseSalary / 160),
            gross,
            deductions: tax,
            net,
            taxRate,
            color: getDepartmentColor(emp.department),
          };
        } else {
          return {
            ...emp,
            name,
            id: "MT-" + String(emp.emp_id).padStart(3, "0"),
            hoursWorked: 0,
            hourlyRate: 0,
            gross: 0,
            deductions: 0,
            net: 0,
            taxRate: 0,
            color: getDepartmentColor(emp.department),
          };
        }
      });
    }
  } catch (error) {
    console.error("Error loading payroll:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPayroll();
});
</script>

<style scoped>
.pay-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px;
}
.pay-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
}
.pay-date {
  font-size: 14px;
  color: #5a5a7a;
  margin-bottom: 8px;
}
.pay-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.pay-stat-card {
  background: #fff;
  border: 1px solid #d8dce6;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.pay-stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #5a5a7a;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
}
.pay-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}
.pay-stat-sub {
  font-size: 12px;
  color: #5a5a7a;
  margin-top: 4px;
}
.pay-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(80, 80, 129, 0.1);
  display: grid;
  place-items: center;
  color: #505081;
}
.pay-card {
  background: #fff;
  border: 1px solid #d8dce6;
  border-radius: 12px;
  overflow: hidden;
}
.pay-card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #d8dce6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.pay-card-title {
  font-size: 16px;
  font-weight: 600;
}
.pay-card-sub {
  font-size: 12px;
  color: #5a5a7a;
  margin-top: 2px;
}
.pay-search-box {
  position: relative;
}
.pay-search-box input {
  padding: 8px 12px 8px 32px;
  border-radius: 8px;
  border: 1px solid #d8dce6;
  font-size: 13px;
  outline: none;
  width: 220px;
}
.pay-search-box svg {
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  color: #5a5a7a;
  width: 15px;
  height: 15px;
}
.pay-table-scroll {
  overflow-x: auto;
}
.pay-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}
.pay-table thead {
  background: #f0f2f7;
  border-bottom: 1px solid #d8dce6;
}
.pay-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #5a5a7a;
  letter-spacing: 0.02em;
}
.pay-table td {
  padding: 12px 16px;
  border-top: 1px solid #d8dce6;
}
.pay-table tbody tr:hover td {
  background: #f0f0f5;
}
.pay-emp-name {
  font-weight: 600;
}
.pay-emp-id {
  font-size: 12px;
  color: #5a5a7a;
}
.pay-net-cell {
  font-weight: 700;
  color: #0f6e6e;
}
.pay-dept-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #505081;
  background: rgba(80, 80, 129, 0.1);
  padding: 2px 8px;
  border-radius: 999px;
  margin-top: 2px;
}
.pay-table-footer {
  padding: 12px 20px;
  font-size: 12px;
  color: #5a5a7a;
  border-top: 1px solid #d8dce6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pay-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 14, 71, 0.4);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1050;
}
.pay-modal.open {
  display: flex;
}
.pay-modal-card {
  background: #fff;
  border-radius: 12px;
  max-width: 520px;
  width: 100%;
  border: 1px solid #d8dce6;
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(15, 14, 71, 0.2);
}
.pay-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #d8dce6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pay-modal-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #f0f2f7;
  color: #5a5a7a;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.pay-modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
.pay-slip-emp {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 16px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #d8dce6;
}
.pay-slip-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0f6e6e;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}
.pay-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #d8dce6;
  font-size: 14px;
}
.pay-row:last-of-type {
  border-bottom: none;
  font-weight: 600;
}
.pay-net-bar {
  margin-top: 16px;
  padding: 14px 16px;
  background: #0f6e6e;
  color: #fff;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pay-slip-month {
  display: inline-block;
  padding: 4px 10px;
  background: #f0f2f7;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: #5a5a7a;
}
@media (max-width: 768px) {
  .pay-stats {
    grid-template-columns: 1fr;
  }
  .pay-search-box input {
    width: 100%;
  }
}
</style>
