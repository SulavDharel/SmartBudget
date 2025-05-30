<script lang="ts">
  import { auth, db } from "$lib/firebase";
  import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
  import { doc, setDoc } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import { USER } from "$lib/stores/user";

  let name = "";
  let email = "";
  let phone = "";
  let password = "";
  let confirmPassword = "";

  let error: string | null = null;
  let loading = false;

  async function signup() {
    error = null;
    if (password !== confirmPassword) {
      error = "Passwords must match.";
      return;
    }

    loading = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      await setDoc(doc(db, "users", cred.user.uid), {
        displayName: name,
        phoneNumber: phone,
        createdAt: new Date(),
      });

      USER.set(cred.user);
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: cred.user.uid,
          email: cred.user.email,
        })
      );

      goto("/dashboard");
    } catch (err: any) {
      error = err.message || "Something went wrong.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <h2>Let's register your account!</h2>

  <!-- Error message -->
  {#if error}
    <p class="error">{error}</p>
  {/if}

  <input type="text" placeholder="Name" bind:value={name} disabled={loading} />
  <input
    type="email"
    placeholder="Email"
    bind:value={email}
    disabled={loading}
  />
  <input type="tel" placeholder="Phone" bind:value={phone} disabled={loading} />
  <input
    type="password"
    placeholder="New password"
    bind:value={password}
    disabled={loading}
  />
  <input
    type="password"
    placeholder="Confirm password"
    bind:value={confirmPassword}
    disabled={loading}
  />

  <button on:click={signup} disabled={loading}>
    {#if loading}
      Signing up…
    {:else}
      Sign up
    {/if}
  </button>

  <div class="login-link">
    Already have an account? <a href="/login">Login</a>
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

  h2 {
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

  .login-link {
    margin-top: 1.5rem;
    font-size: 0.95rem;
    color: #333;
    text-align: center;
  }

  .login-link a {
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
