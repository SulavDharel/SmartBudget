<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { remindersStore } from "$lib/stores/reminders";
  import { transactionsStore } from "$lib/stores/transactions";
  import type { Reminder } from "$lib/types";
  import { budgetStore } from "$lib/stores/budgetStore";

  let date = "";
  let description = "";
  let amount: number | null = null;
  let category = "";
  let transactionType: "income" | "expenditure" = "expenditure";
  let selectedReminderId: number | string | null = null;

  $: today = new Date().toISOString().split("T")[0];
  $: activeCategories = Array.from(
    new Set(
      $budgetStore
        .filter((b) => b.startDate <= today && today <= b.endDate)
        .map((b) => b.category)
    )
  );

  // Reminder form
  let showAddReminder = false;
  let newReminderTitle = "";
  let newReminderAmount: number | null = null;
  let newReminderDescription = "";
  let newReminderCategory = "";
  let newReminderDueDate = "";
  let newReminderType: "income" | "expenditure" = "expenditure";

  // Loading state
  let loadingReminders = true;

  onMount(() => {
    const remindersUnsub = remindersStore.loaded.subscribe((loaded) => {
      loadingReminders = !loaded;
    });

    return () => {
      remindersUnsub();
    };
  });

  // Clean up Firebase listeners on component destroy
  onDestroy(() => {
    remindersStore.destroy();
    transactionsStore.destroy();
  });

  // Add transaction handler
  async function addTransaction() {
    if (date && description && amount !== null && category) {
      try {
        await transactionsStore.add({
          date,
          description,
          amount,
          category,
          type: transactionType,
        });

        // Reset form
        date = "";
        description = "";
        amount = null;
        category = "";
        transactionType = "expenditure";
        selectedReminderId = null;
      } catch (error) {
        alert("Failed to add transaction. Please try again.");
      }
    } else {
      alert("Please fill out all fields.");
    }
  }

  // Add a new reminder
  async function addReminder() {
    if (
      newReminderTitle &&
      newReminderAmount !== null &&
      newReminderDescription &&
      newReminderCategory &&
      newReminderDueDate
    ) {
      try {
        const subtitle =
          `$${newReminderAmount} due on ` +
          new Date(newReminderDueDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

        // Simple icon logic
        let icon = "default";
        const desc = newReminderDescription.toLowerCase();
        const cat = newReminderCategory.toLowerCase();
        if (desc.includes("bill") || cat === "utilities") icon = "bill";
        else if (desc.includes("loan") || cat === "loans") icon = "loan";
        else if (desc.includes("car") || cat === "auto") icon = "car";
        else if (desc.includes("rent") || cat === "rent") icon = "house";

        // Add to store, which handles Firebase
        await remindersStore.add({
          title: newReminderTitle,
          subtitle,
          highlight: false,
          isAI: false,
          amount: newReminderAmount,
          description: newReminderDescription,
          category: newReminderCategory,
          dueDate: newReminderDueDate,
          icon,
          type: newReminderType,
        });

        newReminderTitle = "";
        newReminderAmount = null;
        newReminderDescription = "";
        newReminderCategory = "";
        newReminderDueDate = "";
        showAddReminder = false;
      } catch (error) {
        alert("Failed to add reminder. Please try again.");
      }
    } else {
      alert("Please fill out all fields.");
    }
  }

  // Remove a reminder
  async function removeReminder(id: string) {
    try {
      await remindersStore.remove(id);
      if (selectedReminderId === id) {
        selectedReminderId = null;
      }
    } catch (error) {
      alert("Failed to delete reminder. Please try again.");
    }
  }

  // Populate form when a reminder is clicked
  function handleReminderClick(rem: Reminder) {
    if (!rem.isAI) {
      const today = new Date().toISOString().slice(0, 10);
      date = today;
      description = rem.description ?? "";
      amount = rem.amount ?? null;
      category = rem.category ?? "";
      transactionType = rem.type ?? "expenditure";
      selectedReminderId = rem.id;
    }
  }

  // Accessibility: handle Enter/Space on reminder buttons
  function handleReminderKeyDown(event: KeyboardEvent, rem: Reminder) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleReminderClick(rem);
    }
  }
</script>

<div class="transactions-page">
  <!-- Reminders Column -->
  <div class="reminders-column">
    <h2>Reminders</h2>
    <button class="add-new-btn" on:click={() => (showAddReminder = true)}>
      + Add New
    </button>

    {#if showAddReminder}
      <div class="add-reminder-form">
        <h3>Add New Reminder</h3>
        <form on:submit|preventDefault={addReminder}>
          <div class="form-group">
            <label for="reminderTitle">Title</label>
            <input
              id="reminderTitle"
              type="text"
              bind:value={newReminderTitle}
              required
            />
          </div>
          <div class="form-group">
            <label for="reminderAmount">Amount</label>
            <input
              id="reminderAmount"
              type="number"
              bind:value={newReminderAmount}
              required
            />
          </div>
          <div class="form-group">
            <label for="reminderDescription">Description</label>
            <input
              id="reminderDescription"
              type="text"
              bind:value={newReminderDescription}
              required
            />
          </div>
          <div class="form-group">
            <label for="reminderType">Type</label>
            <select id="reminderType" bind:value={newReminderType}>
              <option value="expenditure">Expenditure</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div class="form-group">
            <label for="reminderCategory">Category</label>
            {#if activeCategories.length}
              <select
                id="reminderCategory"
                bind:value={newReminderCategory}
                required
              >
                <option value="" disabled selected>Select category</option>
                {#each activeCategories as cat}
                  <option value={cat}>{cat}</option>
                {/each}
              </select>
            {:else}
              <input
                id="reminderCategory"
                type="text"
                placeholder="No active budgets"
                disabled
              />
            {/if}
          </div>
          <div class="form-group">
            <label for="reminderDueDate">Due Date</label>
            <input
              id="reminderDueDate"
              type="date"
              bind:value={newReminderDueDate}
              required
            />
          </div>
          <div class="form-buttons">
            <button type="submit">Save</button>
            <button type="button" on:click={() => (showAddReminder = false)}
              >Cancel</button
            >
          </div>
        </form>
      </div>
    {/if}

    <ul class="reminders-list">
      {#each $remindersStore as r}
        <li class="reminder-item">
          <button
            class="reminder-button {selectedReminderId === r.id
              ? 'selected'
              : ''}"
            on:click={() => handleReminderClick(r)}
            on:keydown={(e) => handleReminderKeyDown(e, r)}
            aria-label={r.title}
          >
            <div class="reminder-icon">
              {#if r.icon === "assistant"}
                <!-- assistant icon SVG -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              {:else if r.icon === "bill"}
                <!-- bill icon SVG -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M7 8h10" /><path d="M7 12h10" /><path d="M7 16h6" />
                </svg>
              {:else if r.icon === "car"}
                <!-- car icon SVG -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="7" cy="17" r="2" /><circle
                    cx="17"
                    cy="17"
                    r="2"
                  />
                  <path
                    d="M2 12h20M5 12l1.4-2.9A1.7 1.7 0 0 1 8 8h8c.7 0 1.3.3 1.8.7C18.7 8.6 20 10 20 10"
                  />
                </svg>
              {:else if r.icon === "loan"}
                <!-- loan icon SVG -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              {:else if r.icon === "house"}
                <!-- house icon SVG -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              {:else}
                <!-- default/clock icon SVG -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
              {/if}
            </div>
            <div class="reminder-text">
              <p class="reminder-title">{r.title}</p>
              {#if r.subtitle}
                <p class="reminder-subtitle">{r.subtitle}</p>
              {/if}
            </div>
            {#if !r.isAI}
              <span
                class="delete-btn"
                on:click|stopPropagation={() => removeReminder(r.id)}
                role="button"
                tabindex="0"
                on:keydown={(e) => e.key === "Enter" && removeReminder(r.id)}
                aria-label="Delete reminder">×</span
              >
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <!-- Add Transaction Panel -->
  <div class="add-transaction-panel">
    <h2>Add Transaction</h2>
    <form on:submit|preventDefault={addTransaction} class="transaction-form">
      <div class="form-group">
        <label for="date">Date</label>
        <input id="date" type="date" bind:value={date} />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <input
          id="description"
          type="text"
          placeholder="Description"
          bind:value={description}
        />
      </div>
      <div class="form-group">
        <label for="amount">Amount</label>
        <input
          id="amount"
          type="number"
          placeholder="0.00"
          bind:value={amount}
        />
      </div>
      <div class="form-group">
        <label for="category">Category</label>
        {#if activeCategories.length}
          <select id="category" bind:value={category} required>
            <option value="" disabled selected>Select category</option>
            {#each activeCategories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
        {:else}
          <input
            id="category"
            type="text"
            placeholder="No budgets defined"
            bind:value={category}
            disabled
          />
        {/if}
      </div>
      <div class="form-group">
        <label for="transactionType">Transaction Type</label>
        <select id="transactionType" bind:value={transactionType}>
          <option value="income">Income</option>
          <option value="expenditure">Expenditure</option>
        </select>
      </div>
      <button type="submit" class="submit-btn">Add Transaction</button>
    </form>
  </div>
</div>

<style>
  .transactions-page {
    display: flex;
    padding: 32px;
    gap: 32px;
    background: #ffffff;
  }

  .reminders-column {
    width: 33%;
  }

  .reminders-column h2 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #2d2d2d;
  }

  .add-new-btn {
    display: inline-flex;
    align-items: center;
    background: #2b69f5;
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 24px;
  }

  .reminders-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .reminder-item {
    list-style: none;
    margin-bottom: 16px;
  }

  .reminder-button {
    display: flex;
    align-items: center;
    background: #f7f7f7;
    padding: 16px;
    border-radius: 10px;
    cursor: pointer;
    justify-content: space-between;
    width: 100%;
    border: none;
    text-align: left;
    font-family: inherit;
  }

  .reminder-button.selected {
    border: 2px solid #2b69f5;
    box-shadow: 0 0 5px rgba(43, 105, 245, 0.5);
  }

  .reminder-icon {
    width: 40px;
    height: 40px;
    background: #f4f4f4;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a4a4a;
  }

  .reminder-text {
    margin-left: 12px;
    flex: 1;
  }

  .reminder-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }

  .reminder-subtitle {
    font-size: 10px;
    margin: 4px 0 0 0;
    color: #a8a8a8;
  }

  /* Add Transaction Panel */
  .add-transaction-panel {
    width: 67%;
    background: #ffffff;
    padding: 32px;
    border-radius: 15px;
    box-shadow: 0px 12px 20px rgba(53, 116, 255, 0.25);
  }

  .add-transaction-panel h2 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 24px;
    color: #2d2d2d;
  }

  .transaction-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    font-size: 14px;
    margin-bottom: 8px;
    color: #2d2d2d;
  }

  .form-group input {
    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    font-size: 14px;
  }

  .submit-btn {
    grid-column: span 2;
    padding: 12px;
    background: #2b69f5;
    color: #ffffff;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }

  .add-reminder-form {
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .add-reminder-form h3 {
    margin-top: 0;
    margin-bottom: 16px;
  }

  .add-reminder-form .form-group {
    margin-bottom: 12px;
  }

  .add-reminder-form input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .form-buttons {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .form-buttons button {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #ff4444;
    font-size: 20px;
    padding: 0 8px;
    cursor: pointer;
  }

  .reminder-button:hover .delete-btn {
    display: block;
  }

  .form-group select {
    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    font-size: 14px;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #ff4444;
    font-size: 20px;
    padding: 0 8px;
    cursor: pointer;
    display: inline-block;
  }
</style>
