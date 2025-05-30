<script lang="ts">
  import { auth } from "$lib/firebase";
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { USER } from "$lib/stores/user";

  // form fields
  let email = "";
  let password = "";

  let error: string | null = null;
  let loading = false;

  async function login() {
    error = null;
    loading = true;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      USER.set(result.user);
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
        })
      );
      goto("/dashboard");
    } catch (err: any) {
      error =
        err.code === "auth/wrong-password"
          ? "Incorrect password."
          : err.code === "auth/user-not-found"
            ? "No user found with that email."
            : err.message || "Failed to sign in.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <h1>Let's sign you in</h1>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <input
    type="email"
    placeholder="Email"
    bind:value={email}
    disabled={loading}
  />

  <input
    type="password"
    placeholder="Password"
    bind:value={password}
    disabled={loading}
  />

  <div class="forgot">
    <a href="/forgot-password">Forgot password?</a>
  </div>

  <button on:click={login} disabled={loading}>
    {#if loading}
      Signing in…
    {:else}
      Sign in
    {/if}
  </button>

  <div class="divider">_____ or _____</div>

  <div class="register-link">
    Don't have an account? <a href="/signup">Register now</a>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 400px;
    margin: auto;
    padding: 2rem;
    font-family: sans-serif;
  }

  h1 {
    color: black;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    font-size: 1rem;
  }

  .forgot {
    width: 100%;
    text-align: right;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .forgot a {
    color: black;
    text-decoration: underline;
  }

  button {
    width: 100%;
    background-color: black;
    color: white;
    padding: 1rem;
    font-size: 1rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    margin-top: 1rem;
  }

  .divider {
    margin: 1.5rem 0;
    text-align: center;
    color: #999;
  }

  .register-link {
    font-size: 0.95rem;
    color: #333;
    text-align: center;
  }

  .register-link a {
    color: black;
    text-decoration: underline;
  }
  .error {
    color: #b00020;
    margin-bottom: 1rem;
    text-align: center;
  }
  button[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
