<script>
  import { Eye, EyeOff } from "lucide-svelte";

  export let balance = 0;
  export let income = 0;
  export let savings = 0;

  let showStats = false;
</script>

<div class="stats-wrapper">
  <button
    on:click={() => (showStats = !showStats)}
    class="icon-button"
    aria-label="Toggle Stats Visibility"
  >
    {#if showStats}
      <EyeOff size="20" />
    {:else}
      <Eye size="20" />
    {/if}
  </button>

  <div class="stats-container">
    <div class="stat-card">
      <div class="stat-title">Balance</div>
      <div class="stat-value">{showStats ? `$${balance}` : "••••"}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Income</div>
      <div class="stat-value">{showStats ? `$${income}` : "••••"}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Savings</div>
      <div class="stat-value">{showStats ? `$${savings}` : "••••"}</div>
    </div>
  </div>
</div>

<style>
  .stats-container{
    padding:20px;
  }

  .stats-wrapper {
    position: relative;
  }

  .icon-button {
    position: absolute;
    top:0.7rem;
    right: 0.7rem;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 50%;
    padding: 0.3rem;
    cursor: pointer;
    color: #2e3a46;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .stats-container {
    display: flex;
    gap: 1rem;
  }

  .stat-card {
    flex: 1;
    padding: 1rem;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .stat-title {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
    color: #2e3a46;
  }
</style>
