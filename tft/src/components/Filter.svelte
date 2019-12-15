<script>
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  export let name;
  export let isFocus;

  function message() {
		dispatch('message', {
      data: name,
		});
	}
</script>

<style>
  .filter {
    display: inline-block;
    font-size : 8px;
    color: #7d7d7d;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer;
  }
  .filter:hover {
    color: blue;
    font-size: 14px;
  }
  .active {
    color: blue;
    font-size: 14px;
  }
</style>

<div class='filter {isFocus ? 'active' : ''}' on:click={message} >
  {name}
</div>