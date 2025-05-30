<script lang="ts">
  import { onDestroy } from "svelte";
  import { dashboardStats } from "$lib/stores/dashboard";
  import Topbar from "$lib/components/Topbar.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import DashboardStats from "$lib/components/DashboardStats.svelte";

  let balance: number;
  let income: number;
  let savings: number;

  const unsubscribe = dashboardStats.subscribe(($stats) => {
    balance = $stats.balance;
    income = $stats.income;
    savings = $stats.savings;
  });

  onDestroy(unsubscribe);
</script>

<div class="dashboard-container">
  <Sidebar />
  <div class="content">
    <Topbar currentBalance={balance} />
    <div class="statscontainer">
      <DashboardStats {balance} {income} {savings} />
    </div>
    <slot />
  </div>
</div>

<style>
  .dashboard-container {
    display: flex;
    height: 100vh;
  }
  .statscontainer {
    background-color: #edf2f6;
    padding: 0 20px 0 20px;
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
