import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";

interface CategorySummary {
  category: string;
  total: number;
}

interface MonthlySummary {
  month: number;
  year: number;
  total_expense: number;
  by_category: CategorySummary[];
}

export default function ReportsPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMonthlyReport();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyReport = async () => {
    try {
      const data = await api(`/me/reports/monthly?month=${selectedMonth}&year=${selectedYear}`);
      setMonthlyData(data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };

  const generateChartData = () => {
    if (!monthlyData) return [];

    return monthlyData.by_category.map(item => ({
      category: item.category,
      value: item.total,
      percentage: (item.total / monthlyData.total_expense) * 100
    })).sort((a, b) => b.value - a.value);
  };

  const chartData = generateChartData();

  return (
    <Layout title="Reports">
      <div className="page-header">
        <div className="header-content">
          <h2>Financial Reports</h2>
          <p>Analyze your spending patterns and trends</p>
        </div>

        <div className="date-selector">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Total Expenses</div>
              <div className="summary-value">
                ${monthlyData?.total_expense.toFixed(2) || "0.00"}
              </div>
              <div className="summary-period">
                {getMonthName(selectedMonth)} {selectedYear}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-label">Categories</div>
              <div className="summary-value">{chartData.length}</div>
              <div className="summary-period">Tracked</div>
            </div>

            <div className="summary-card">
              <div className="summary-label">Top Category</div>
              <div className="summary-value">
                {chartData.length > 0 ? chartData[0].category : "N/A"}
              </div>
              <div className="summary-period">
                {chartData.length > 0 ? `$${chartData[0].value.toFixed(2)}` : "$0.00"}
              </div>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="empty-state">
              <p>No expense data for {getMonthName(selectedMonth)} {selectedYear}</p>
            </div>
          ) : (
            <>
              <div className="chart-container">
                <h3>Spending by Category</h3>
                <div className="bar-chart">
                  {chartData.map((item, index) => (
                    <div key={item.category} className="bar-item">
                      <div className="bar-label">
                        <span className="category-name">{item.category}</span>
                        <span className="category-value">${item.value.toFixed(2)}</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="bar-percentage">
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="table-card">
                <h3>Detailed Breakdown</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Percentage</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((item) => (
                      <tr key={item.category}>
                        <td>
                          <span className="category-tag">{item.category}</span>
                        </td>
                        <td className="amount-cell">${item.value.toFixed(2)}</td>
                        <td>{item.percentage.toFixed(1)}%</td>
                        <td>
                          <div className="trend-indicator">
                            <div
                              className="trend-bar"
                              style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
}