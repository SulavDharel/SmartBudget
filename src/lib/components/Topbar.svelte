<script lang="ts">
  import { onMount } from "svelte";
  import { Search, Bell, User } from "lucide-svelte";
  import { auth, db } from "$lib/firebase";
  import { signOut } from "firebase/auth";
  import { collection, getDocs, query, orderBy } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import SetBalanceModal from "$lib/components/setBalanceModal.svelte";

  export let currentBalance = 0;

  let searchText = "";
  let showNotifications = false;
  let showProfile = false;
  let showBalanceModal = false;

  // UI state
  let notifications: {
    id: string;
    title: string;
    message: string;
    time: string;
  }[] = [];
  let loadingNotifs = true;
  let notifError: string | null = null;

  // Fetch real notifications on mount
  onMount(async () => {
    const user = auth.currentUser;
    if (!user) {
      notifError = "Not signed in";
      loadingNotifs = false;
      return;
    }

    try {
      const notifsRef = collection(db, "users", user.uid, "notifications");
      const q = query(notifsRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      notifications = snap.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          title: data.title,
          message: data.message,
          time: data.createdAt?.toDate().toLocaleString() || "",
        };
      });
    } catch (e: any) {
      notifError = e.message || "Failed to load notifications";
    } finally {
      loadingNotifs = false;
    }
  });

  function handleClickOutside(event: MouseEvent) {
    if (
      !event.target ||
      !(event.target as HTMLElement).closest(".dropdown, .icon-button")
    ) {
      showNotifications = false;
      showProfile = false;
    }
  }

  async function logout() {
    await signOut(auth);
    showProfile = false;
    goto("/login");
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="topbar">
  {#if showBalanceModal}
    <SetBalanceModal
      {currentBalance}
      on:close={() => (showBalanceModal = false)}
    />
  {/if}

  <div class="search">
    <Search
      class="icon"
      size={20}
      style="position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #71717a;"
    />
    <input type="text" placeholder="Search..." bind:value={searchText} />
  </div>
  <div class="icons">
    <div class="notification-wrapper">
      <button
        class="icon-button"
        aria-label="Notifications"
        on:click={() => {
          showNotifications = !showNotifications;
          showProfile = false;
        }}
      >
        <Bell size={24} />
        {#if !loadingNotifs && notifications.length != 0}
          <span class="badge">{notifications.length}</span>
        {/if}
      </button>
      {#if showNotifications}
        <div class="dropdown notifications">
          {#if loadingNotifs}
            <div class="notification-item">Loading…</div>
          {:else if notifError}
            <div class="notification-item error">{notifError}</div>
          {:else if notifications.length === 0}
            <div class="notification-item">No notifications</div>
          {:else}
            {#each notifications as n}
              <div class="notification-item">
                <h4>{n.title}</h4>
                <p>{n.message}</p>
                <small>{n.time}</small>
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <div class="profile-wrapper">
      <button
        class="icon-button"
        aria-label="Profile"
        on:click={() => {
          showProfile = !showProfile;
          showNotifications = false;
        }}
      >
        <User size={24} />
      </button>
      {#if showProfile}
        <div class="dropdown profile">
          <button
            on:click={() => (showBalanceModal = true)}
            class="logout-button"
          >
            Set Balance
          </button>
          <button on:click={logout} class="logout-button"> Logout </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .topbar {
    display: flex;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #fff;
    border-bottom: 1px solid #e4e4e7;
    gap: 1.5rem;
    position: relative;
  }

  .search {
    position: relative;
    flex: 1 1 auto;
    max-width: 400px;
    margin-right: auto;
  }

  .search input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 0.875rem;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    background: #fafafa;
    transition: all 0.2s ease;
  }

  .search input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .icons {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-shrink: 0;
  }

  .icon-button {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    transition: background 0.2s ease;
  }

  .icon-button:hover {
    background: #f4f4f5;
  }

  .badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: #ef4444;
    color: white;
    font-size: 0.75rem;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    background: white;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .notifications {
    min-width: 320px;
    padding: 0.5rem 0;
  }

  .notification-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f4f4f5;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .notification-item:hover {
    background: #fafafa;
  }

  .notification-item h4 {
    font-size: 0.875rem;
    font-weight: 500;
    margin: 0 0 0.25rem;
  }

  .notification-item p {
    font-size: 0.875rem;
    color: #71717a;
    margin: 0 0 0.25rem;
  }

  .notification-item small {
    font-size: 0.75rem;
    color: #a1a1aa;
  }

  .profile {
    min-width: 160px;
    padding: 0.5rem 0;
  }

  .logout-button {
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: #3f3f46;
    font-size: 0.875rem;
    transition: background 0.2s ease;
  }

  .logout-button:hover {
    background: #f4f4f5;
  }

  .notification-wrapper,
  .profile-wrapper {
    position: relative;
  }
  .notification-item.error {
    color: #b00020;
  }
</style>
