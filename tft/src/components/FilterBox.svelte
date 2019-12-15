<script>
  import Filter from './Filter.svelte'
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  export let names;
  export const activeArray = names.reduce((p, c) => {
    p[c] = false;
    return p;
  }, {})

  function sender(event) {
    focus(event.detail.data);
    dispatch('message', {
      data: event.detail.data,
    });
  }

  function focus(focusName) {
    for (const name of names) {
      activeArray[name] = false;
    }
    activeArray[focusName] = true;
  }
</script>

<style>
@media screen and (min-width: 300px) {
  .filterBox {
    width: 90%;
    margin-left: 5%;
    margin-bottom: 20px;
  }
}
@media screen and (min-width: 769px) {
  .filterBox {
    width: 60%;
    margin-left: 20%;
    margin-bottom: 20px;
  }
}
</style>

<div class="filterBox">
  {#each names as name}
    <Filter name={name} isFocus={activeArray[name]} on:message={sender} />
  {/each}
</div>