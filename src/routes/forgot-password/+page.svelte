<script lang="ts">
  import { auth } from "$lib/firebase";
  import { sendPasswordResetEmail } from "firebase/auth";

  let email = "";
  let error: string | null = null;
  let success = false;
  let loading = false;

  async function handleSubmit() {
    error = null;
    success = false;
    if (!email) {
      error = "Please enter your email address.";
      return;
    }

    loading = true;
    try {
      await sendPasswordResetEmail(auth, email);
      success = true;
    } catch (err: any) {
      // Map common Firebase errors to friendly messages
      switch (err.code) {
        case "auth/invalid-email":
          error = "That email address is malformed.";
          break;
        case "auth/user-not-found":
          // We don't reveal whether user exists, but you can choose to say “Email sent.”
          error = "If an account exists, you will receive a reset email.";
          success = true;
          break;
        default:
          error = "Failed to send reset email. Try again later.";
      }
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <h2>Reset Your Password</h2>

  {#if success}
    <p class="msg success">
      If that email exists, you'll receive a reset link shortly.
    </p>
  {/if}

  {#if error}
    <p class="msg error">{error}</p>
  {/if}

  <input
    type="email"
    placeholder="Enter your email"
    bind:value={email}
    disabled={loading || success}
  />

  <button on:click={handleSubmit} disabled={loading || success}>
    {#if loading}Sending…{:else}Send Reset Link{/if}
  </button>

  <p style="text-align:center; margin-top:1rem;">
    <a href="/login">Back to Login</a>
  </p>
</div>

<style>
  .container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    font-family: sans-serif;
  }
  input,
  button {
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
  }
  button {
    background: black;
    color: white;
    border: none;
    cursor: pointer;
  }
  .msg {
    font-size: 0.9rem;
  }
  .error {
    color: #b00020;
  }
  .success {
    color: #006400;
  }
</style>
