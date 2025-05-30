<script lang="ts">
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";
  import { budgetStore } from "$lib/stores/budgetStore";
  import { chartData } from "$lib/stores/budgetStore";
  import type { Budget, Transaction } from "$lib/types";

  let chart: Chart | null = null;
  let editingBudget: Budget | null = null;
  let showAddBudget = false;

  let newBudgetCategory = "";
  let newBudgetAmount: number | null = null;
  let newBudgetStartDate = "";
  let newBudgetEndDate = "";

  $: totalBudget = $budgetStore.reduce((sum, b) => sum + b.amount, 0);
  $: totalSpent = $budgetStore.reduce((sum, b) => sum + b.spent, 0);
  $: remainingDays = getRemainingDays();

  function getRemainingDays(): number {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDay.getDate() - today.getDate();
  }

  function updateChart(labels: string[], data: number[]) {
    if (chart) chart.destroy();

    const ctx = document.getElementById("spendingChart") as HTMLCanvasElement;

    if (!ctx) return;

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Spending",
            data,
            fill: false,
            borderColor: "#2b69f5",
            tension: 0.4,
            pointBackgroundColor: "#2b69f5",
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } },
      },
    });
  }

  async function handleSave() {
    if (!newBudgetCategory || !newBudgetAmount) return;

    const budgetData = {
      category: newBudgetCategory,
      amount: newBudgetAmount,
      startDate: newBudgetStartDate,
      endDate: newBudgetEndDate,
      spent: 0,
    };

    if (editingBudget) {
      await budgetStore.update(editingBudget.id, budgetData);
    } else {
      await budgetStore.add(budgetData);
    }

    resetForm();
  }

  function resetForm() {
    newBudgetCategory = "";
    newBudgetAmount = null;
    newBudgetStartDate = "";
    newBudgetEndDate = "";
    editingBudget = null;
    showAddBudget = false;
  }

  function editBudget(budget: Budget) {
    editingBudget = budget;
    newBudgetCategory = budget.category;
    newBudgetAmount = budget.amount;
    newBudgetStartDate = budget.startDate;
    newBudgetEndDate = budget.endDate;
    showAddBudget = true;
  }

  onMount(() => {
    const unsubscribe = chartData.subscribe(({ months, spendingData }) => {
      updateChart(months, spendingData);
    });
    return () => {
      if (chart) chart.destroy();
    };
  });
</script>

<div class="budget-page">
  <div class="left-column">
    <div class="spending-chart">
      <h2>My Spending</h2>
      <div class="chart-container">
        <canvas id="spendingChart"></canvas>
      </div>
    </div>

    <div class="budget-summary">
      <div class="budget-stats">
        <div>
          <p>
            Budget for {new Date().toLocaleString("default", { month: "long" })}
          </p>
          <h2>${totalBudget.toFixed(2)}</h2>
        </div>
        <div>
          <p>Spent so far</p>
          <h2>${totalSpent.toFixed(2)}</h2>
        </div>
        <div>
          <p>Remaining for {remainingDays} days</p>
          <h2>${(totalBudget - totalSpent).toFixed(2)}</h2>
        </div>
      </div>
    </div>
  </div>

  <div class="right-column">
    <div class="budget-actions">
      <h3>Your Budgets</h3>
      <button class="add-budget-btn" on:click={() => (showAddBudget = true)}>
        + Add Budget
      </button>
    </div>

    {#if showAddBudget}
      <div class="budget-form">
        <h3>{editingBudget ? "Edit Budget" : "Add New Budget"}</h3>
        <form on:submit|preventDefault={handleSave}>
          <div class="form-group">
            <label for="category">Category</label>
            <input
              id="category"
              type="text"
              bind:value={newBudgetCategory}
              required
            />
          </div>
          <div class="form-group">
            <label for="amount">Amount</label>
            <input
              id="amount"
              type="number"
              bind:value={newBudgetAmount}
              required
            />
          </div>
          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              bind:value={newBudgetStartDate}
              required
            />
          </div>
          <div class="form-group">
            <label for="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              bind:value={newBudgetEndDate}
              required
            />
          </div>
          <div class="form-buttons">
            <button type="submit">
              {editingBudget ? "Save Changes" : "Add Budget"}
            </button>
            <button type="button" on:click={resetForm}>Cancel</button>
          </div>
        </form>
      </div>
    {/if}

    <div class="budget-list">
      {#each $budgetStore as budget}
        <div class="budget-item">
          <div class="budget-category-icon">
            <!-- Icon placeholder -->
          </div>
          <div class="budget-info">
            <div class="budget-header">
              <h4>{budget.category}</h4>
              <div class="budget-actions">
                <button class="edit-btn" on:click={() => editBudget(budget)}>
                  Edit
                </button>
                <button
                  class="delete-btn"
                  on:click={() => budgetStore.remove(budget.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <div class="budget-progress">
              <div class="progress-bar">
                <div
                  class="progress"
                  style="width: {Math.min(
                    100,
                    (budget.spent / budget.amount) * 100
                  )}%"
                ></div>
              </div>
              <div class="budget-amounts">
                <span>${budget.spent.toFixed(2)} spent</span>
                <span>${(budget.amount - budget.spent).toFixed(2)} left</span>
              </div>
            </div>
            <div class="budget-dates">
              <span>
                {new Date(budget.startDate).toLocaleDateString()} -
                {new Date(budget.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .budget-page {
    display: flex;
    flex-wrap: wrap;
    padding: 32px;
    gap: 32px;
    background: #ffffff;
  }

  .left-column {
    flex: 1 1 60%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .spending-chart {
    background: #ffffff;
    padding: 24px;
    border-radius: 15px;
    box-shadow: 0px 12px 20px rgba(53, 116, 255, 0.1);
  }

  .spending-chart h2 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #2d2d2d;
  }

  .chart-container {
    height: 250px;
    position: relative;
  }

  .budget-summary {
    background: #2b69f5;
    color: #ffffff;
    padding: 24px;
    border-radius: 15px;
    text-align: center;
  }

  .budget-stats {
    display: flex;
    justify-content: space-between;
  }

  .budget-summary p {
    margin: 0;
    font-size: 14px;
  }

  .budget-summary h2 {
    font-size: 24px;
    margin: 8px 0 0 0;
  }

  .right-column {
    flex: 1 1 35%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .budget-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .budget-actions h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #2d2d2d;
  }

  .add-budget-btn {
    display: inline-flex;
    align-items: center;
    background: #2b69f5;
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  }

  .budget-form {
    background: #fff;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
  }

  .budget-form h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
  }

  .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
  }

  .form-buttons {
    display: flex;
    gap: 10px;
  }

  .form-buttons button {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  }

  .form-buttons button:first-child {
    background: #2b69f5;
    color: white;
  }

  .form-buttons button:last-child {
    background: #f1f1f1;
    color: #333;
  }

  .budget-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .budget-item {
    background: #f7f7f7;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 16px;
  }

  .budget-category-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #d0dbef;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .budget-info {
    flex: 1;
  }

  .budget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .budget-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .budget-actions button {
    background: none;
    border: none;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
    color: #666;
  }

  .budget-actions button:hover {
    color: #2b69f5;
  }

  .budget-progress {
    margin-bottom: 8px;
  }

  .progress-bar {
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress {
    height: 100%;
    background: #2b69f5;
  }

  .budget-amounts {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #666;
  }

  .budget-dates {
    font-size: 12px;
    color: #888;
  }

  .edit-btn {
    color: #2b69f5;
  }

  .delete-btn {
    color: #f44336;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .budget-page {
      flex-direction: column;
    }

    .left-column,
    .right-column {
      width: 100%;
    }

    .budget-stats {
      flex-direction: column;
      gap: 16px;
    }
  }
</style>
