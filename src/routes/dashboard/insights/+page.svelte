<script lang="ts">
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";
  import { Info } from "lucide-svelte";

  const tips = [
    "You can save $200 by limiting shopping to $50 per day.",
    "You spend 20% more on dining this month compared to the previous period.",
  ];

  let selectedDuration = "This Month";

  function selectDuration(duration: string) {
    selectedDuration = duration;
  }

  let chartCanvas: HTMLCanvasElement;
  let chartInstance: Chart;

  onMount(() => {
    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth(); // 0-based index

    const labels: string[] = [];
    const dataValues: number[] = [];
    const backgroundColors: string[] = [];
    // Dummy full data for each month
    const fullData = [
      120, 150, 130, 170, 200, 160, 180, 190, 210, 170, 160, 200,
    ];

    // Loop for past 7 months: i=6 means 6 months ago, down to i=0 (current month).
    for (let i = 6; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      labels.push(monthLabels[idx]);
      dataValues.push(fullData[idx]);
      // Highlight the current month (i==0) in green, others in gray.
      backgroundColors.push(i === 0 ? "#28a745" : "#B1CFFF");
    }

    const data = {
      labels,
      datasets: [
        {
          label: "Money",
          data: dataValues,
          backgroundColor: backgroundColors,
        },
      ],
    };

    const config = {
      type: "bar" as const,
      data,
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: "Months" } },
          y: { title: { display: true }, beginAtZero: true },
        },
      },
    };

    chartInstance = new Chart(chartCanvas, config);
    return () => {
      chartInstance.destroy();
    };
  });
</script>

<div class="dashboard-container">

  <div class="content">
    <!-- Main content area -->
    <div class="main">
      <div class="insights-content">
        <!-- Left Column: Chart -->
        <div class="chart-container">
          <canvas bind:this={chartCanvas}></canvas>
        </div>

        <!-- Right Column: AI Assistant -->
        <div class="ai-assistant">
          <div class="duration-buttons">
            <button
              class:active={selectedDuration === "This Month"}
              on:click={() => selectDuration("This Month")}
            >
              This Month
            </button>
            <button
              class:active={selectedDuration === "6 Months"}
              on:click={() => selectDuration("6 Months")}
            >
              6 Months
            </button>
            <button
              class:active={selectedDuration === "9 Months"}
              on:click={() => selectDuration("9 Months")}
            >
              9 Months
            </button>
            <button
              class:active={selectedDuration === "12 Months"}
              on:click={() => selectDuration("12 Months")}
            >
              12 Months
            </button>
          </div>
          <div class="tips">
            {#each tips as tip}
              <div class="tip-item">
                <Info size={16} class="tip-icon" />
                <span>{tip}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Overall dashboard container */
  .dashboard-container {
    display: flex;
    overflow-x: hidden;
  }
  /* Content area styling */
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .main {
    flex: 1;
    padding: 1rem;
    background-color: #eef2f5;
    overflow-y: auto;
    width: 100%;
  }

  /* Two-column layout inside insights page */
  .insights-content {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  .chart-container {
    flex: 1 1 auto;
    background: #fff;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .chart-container canvas {
    width: 100%;
    height: auto;
  }
  .ai-assistant {
    flex: 1 1 auto;
    background: #fff;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-right: 40px;
  }
  .duration-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .duration-buttons button {
    flex: 1;
    padding: 0.5rem;
    font-size: 0.9rem;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .duration-buttons button:hover {
    background-color: #eef;
  }
  .duration-buttons button.active {
    background-color: #007bff;
    color: #fff;
    border-color: #007bff;
  }
  .tips {
    background-color: #f3f3f3;
    border-radius: 4px;
    padding: 0.75rem;
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .tip-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 10px 0;
  }

  @media (max-width: 768px) {
    .insights-content {
      flex-direction: column;
    }
  }
</style>
