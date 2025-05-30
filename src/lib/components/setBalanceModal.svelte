<script lang="ts">
  import { db, auth } from "$lib/firebase";
  import { doc, setDoc } from "firebase/firestore";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  export let currentBalance = 0;

  let balance: number = 0;
  let loading = false;
  let error: string | null = null;
  let mode: "set" | "add" = "set";

  async function saveBalance() {
    const user = auth.currentUser;
    if (!user) {
      error = "You must be logged in.";
      return;
    }

    if (balance < 0) {
      error = "Amount cannot be negative";
      return;
    }

    loading = true;
    try {
      const userDoc = doc(db, "users", user.uid);
      const newBalance = mode === "set" ? balance : currentBalance + balance;
      await setDoc(userDoc, { balance: newBalance }, { merge: true });
      dispatch("close");
    } catch (e) {
      error = "Failed to save balance.";
      console.error(e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal">
  <div class="modal-content">
    <h2>{mode === "set" ? "Set Balance" : "Adjust Balance"}</h2>
    <p class="subtitle">
      {mode === "set"
        ? "Set your new base balance"
        : `Add to current balance (${currentBalance.toFixed(2)})`}
    </p>

    <div class="mode-selector">
      <button class:selected={mode === "set"} on:click={() => (mode = "set")}>
        Set New Balance
      </button>
      <button class:selected={mode === "add"} on:click={() => (mode = "add")}>
        Add to Balance
      </button>
    </div>

    <input
      type="number"
      bind:value={balance}
      min="0"
      step="0.01"
      placeholder={mode === "set" ? "Enter new balance" : "Enter amount to add"}
    />

    {#if error}<p class="error">{error}</p>{/if}

    <div class="actions">
      <button on:click={() => dispatch("close")} class="cancel">
        Cancel
      </button>
      <button on:click={saveBalance} disabled={loading} class="save">
        {loading ? "Saving..." : mode === "set" ? "Set Balance" : "Add Funds"}
      </button>
    </div>
  </div>
</div>

<style>
  .mode-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .mode-selector button {
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .mode-selector button.selected {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
  }

  input {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    transition: border-color 0.2s ease;
  }
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #1a1a1a;
  }

  .subtitle {
    margin: 0 0 1.5rem 0;
    color: #64748b;
    font-size: 0.9rem;
  }

  input {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    transition: border-color 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  button {
    padding: 0.75rem 1.25rem;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .save {
    background: #3b82f6;
    color: white;
    border: none;
  }

  .save:hover {
    background: #2563eb;
  }

  .save:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  .cancel {
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }

  .cancel:hover {
    background: #e2e8f0;
  }

  .error {
    color: #dc2626;
    font-size: 0.875rem;
    margin: -0.75rem 0 1rem 0;
    padding: 0.25rem 0;
  }
</style>
