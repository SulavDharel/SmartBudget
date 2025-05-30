<script lang="ts">
  import { transactionsStore } from "$lib/stores/transactions";
  import TransactionTable from "$lib/components/TransactionTable.svelte";

  $: transactions = $transactionsStore;
</script>

<div class="dashboard-container">
  <div class="content">
    <div class="main">
      <TransactionTable {transactions} />
    </div>
  </div>
</div>

<style>
  .dashboard-container {
    display: flex;
    height: 100vh;
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .main {
    flex: 1;
    padding: 1rem 2rem;
    background-color: #eef2f5;
    overflow-y: auto;
  }
</style>
