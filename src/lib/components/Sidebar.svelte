<script lang="ts">
  import { page } from "$app/stores";
  import { derived } from "svelte/store";
  import {
    Home,
    BarChart2,
    PlusCircle,
    Wallet,
    Shield,
    Settings,
  } from "lucide-svelte";

  // Derive the current pathname from the $page store
  const pathname = derived(page, ($page) => $page.url.pathname);
</script>

<div class="sidebar">
  <nav class="nav-top">
    <a href="/dashboard" class:active={$pathname === "/dashboard"}>
      <Home size={18} /> <span>Overview</span>
    </a>
    <a
      href="/dashboard/insights"
      class:active={$pathname === "/dashboard/insights"}
    >
      <BarChart2 size={18} /> <span>View Insights</span>
    </a>
    <a
      href="/dashboard/transactions"
      class:active={$pathname === "/dashboard/transactions"}
    >
      <PlusCircle size={18} /> <span>Add Transactions</span>
    </a>
    <a
      href="/dashboard/budgets"
      class:active={$pathname === "/dashboard/budgets"}
    >
      <Wallet size={18} /> <span>Set Budget</span>
    </a>
  </nav>

  <nav class="nav-bottom">
    <a href="/security" class:active={$pathname === "/security"}>
      <Shield size={18} /> <span>Security</span>
    </a>
    <a href="/settings" class:active={$pathname === "/settings"}>
      <Settings size={18} /> <span>Settings</span>
    </a>
  </nav>
</div>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #fff;
    padding: 1.5rem;
    width: 240px;
    height: 90vh;
    border-right: 1px solid #eee;
  }

  .nav-top,
  .nav-bottom {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: #333;
    font-weight: 500;
    padding: 0.75rem;
    border-radius: 0.5rem;
    transition: background 0.2s ease;
  }

  a:hover {
    background-color: #f5f5f5;
  }

  a.active {
    background-color: #006aff;
    color: white;
    font-weight: 600;
  }
</style>
