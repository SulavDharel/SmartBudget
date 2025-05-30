<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  onMount(() => {
    if (!browser) return;

    const user = localStorage.getItem("user");

    if (!user) {
      goto("/login");
    }
  });
</script>

<slot />
