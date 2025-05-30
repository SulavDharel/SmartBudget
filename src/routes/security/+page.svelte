<script lang="ts">
  import Sidebar from "$lib/components/Sidebar.svelte";
  import Topbar from "$lib/components/Topbar.svelte";
  import { goto } from "$app/navigation";

  const verifyViaSMS = () => goto("/verify-sms");
  const verifyViaAuthenticator = () => goto("/verify-totp");
  const registerNewDevice = () => goto("/register-device");
</script>

<div class="dashboard-container">
  <Sidebar />
  <div class="content">

    <div class="verify-container">
      <h2>Verify your identity with</h2>

      <div class="verify-option" on:click={verifyViaSMS}>
        <span>📩 SMS</span>
        <p>+39 342 401 97 23</p>
      </div>

      <div class="verify-option" on:click={verifyViaAuthenticator}>
        <span>🔒 Google Authenticator</span>
        <p>You'll find the code in the app</p>
      </div>

      <a class="register-link" on:click={registerNewDevice}>
        Register new device
      </a>
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
    background-color: #edf2f6;
    padding: 20px;
  }
  .verify-container {
    margin: auto;
    max-width: 400px;
    padding: 32px;
    text-align: center;
  }
  .verify-option {
    background: #f7f7f7;
    padding: 16px;
    margin-top: 16px;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .verify-option:hover {
    background: #e0e8ff;
  }
  .register-link {
    display: block;
    margin-top: 24px;
    font-size: 14px;
    color: #2b69f5;
    cursor: pointer;
  }
</style>
