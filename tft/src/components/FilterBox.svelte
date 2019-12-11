<script>
  import Filter from './Filter.svelte'
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  export let filters;

  function message() {
		dispatch('message', {
      data: name,
		});
  }

  function hello(event) {
    dispatch('message', {
      data: event.detail.data,
    });
  }
</script>

<style>
.filterBox {
  width: 60%;
  margin-left: 20%;
  margin-bottom: 20px;
  margin-top: 20px;
}
</style>

<div class="filterBox">
  {#each filters as filter}
    <Filter name={filter.name} on:message={hello} />
  {/each}
</div>