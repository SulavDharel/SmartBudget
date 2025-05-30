<script lang="ts">
  import type { Transaction } from "$lib/types";
  export let transactions: Transaction[] = [];
</script>

<table class="transactions-table">
  <thead>
    <tr>
      <th>Date</th>
      <th>Type</th>
      <th>Category</th>
      <th class="align-right">Amount</th>
    </tr>
  </thead>
  <tbody>
    {#each transactions as txn}
      <tr class={txn.type}>
        <td>{txn.date}</td>
        <td class="capitalize">{txn.type}</td>
        <td>{txn.category}</td>
        <td class="amount align-right">${txn.amount.toFixed(2)}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  :root {
    --income-bg: #e8f5e9; 
    --expense-bg: #ffebee;
    --hover-shadow: rgba(0, 0, 0, 0.1);
    --accent-color: #2b69f5;
  }

  .transactions-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 6px;
    font-family: system-ui, sans-serif;
    margin-top: 1rem;
  }
  .transactions-table tr td {
    text-align: center; 
  }

   .transactions-table tr td:nth-last-child {
    text-align: right; 
  }
   

  thead th {
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    font-weight: 600;
    color: #555;
    padding: 10px 12px;
    background: #f5f5f5;
    border-bottom: none;
  }

  tbody tr {
    background: #fff;
    transition:
      transform 0.15s,
      box-shadow 0.15s;
    box-shadow: 0 1px 2px var(--hover-shadow);
    border-left: 4px solid transparent;
  }
  tbody tr.income {
    background: var(--income-bg);
  }
  tbody tr.expenditure {
    background: var(--expense-bg);
  }

  tbody tr:nth-child(even):not(.income):not(.expenditure) {
    background: #fafafa;
  }

  tbody tr:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--hover-shadow);
    border-left-color: var(--accent-color);
  }

  td,
  th {
    padding: 12px;
  }

  .amount {
    font-family: "Courier New", monospace;
    font-weight: 500;
  }

  .align-right {
    text-align: right;
  }

  .capitalize {
    text-transform: capitalize;
  }
</style>
