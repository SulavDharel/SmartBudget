<script context="module" lang="ts">
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import { app } from "$lib/firebase";
  import {
    getAuth,
    updatePassword,
    deleteUser,
    type User,
  } from "firebase/auth";

  // ---- Auth/User Setup ----
  const auth = getAuth(app);
  let user: User | null = null;
  let newPassword = "";

  onMount(() => {
    user = auth.currentUser;
  });

  const handlePasswordUpdate = async () => {
    if (!user) return alert("No user signed in.");
    if (newPassword.length < 6)
      return alert("Password must be at least 6 characters.");

    try {
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");
      newPassword = "";
    } catch (e) {
      console.error(e);
      alert("Failed to update password. You may need to reauthenticate.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (
      !confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    )
      return;

    try {
      await deleteUser(user);
      alert("Account deleted. Goodbye!");
    } catch (e) {
      console.error(e);
      alert("Failed to delete account. You may need to reauthenticate.");
    }
  };
</script>

<div class="settings-container">
  <Sidebar />

  <div class="content">
    <div class="settings-panel">
      <h2>Settings</h2>

      <!-- Account Info -->
      <section>
        <h3>Account Info</h3>
        <p><strong>Email:</strong> {user?.email ?? "—"}</p>
      </section>

      <!-- Update Password -->
      <section>
        <h3>Update Password</h3>
        <input
          type="password"
          placeholder="New Password"
          bind:value={newPassword}
        />
        <button on:click={handlePasswordUpdate}> Update Password </button>
      </section>

      <section>
        <h3>Security</h3>
        <button disabled>2FA Settings (Coming Soon)</button>
        <button disabled>Manage Devices (Coming Soon)</button>
      </section>

      <section>
        <h3>Preferences</h3>
        <div class="preference-item">
          <label>
            <input type="checkbox" disabled />
            Dark Mode (Coming Soon)
          </label>
        </div>
        <div class="preference-item">
          <label for="">Language:</label>
          <select disabled>
            <option>English</option>
          </select>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="danger-zone">
        <h3>Danger Zone</h3>
        <button class="delete-btn" on:click={handleDeleteAccount}>
          Delete Account
        </button>
      </section>
    </div>
  </div>
</div>

<style>
  .settings-container {
    display: flex;
    height: 100vh;
  }
  .content {
    flex: 1;
    padding: 32px;
    background: #f5f7fb;
    overflow-y: auto;
  }
  .settings-panel {
    max-width: 600px;
    margin: auto;
    background: #fff;
    padding: 32px;
    border-radius: 15px;
    box-shadow: 0 12px 20px rgba(53, 116, 255, 0.1);
  }
  h2 {
    font-size: 24px;
    margin-bottom: 24px;
  }
  section {
    margin-bottom: 32px;
  }
  section h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }
  .preference-item {
    margin-top: 8px;
  }
  input[type="password"] {
    width: 100%;
    padding: 8px;
    margin-top: 8px;
    margin-bottom: 12px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
  }
  button {
    background: #2b69f5;
    color: #fff;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  button.delete-btn {
    background: #ff4d4d;
  }
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  .danger-zone {
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
  }
</style>
