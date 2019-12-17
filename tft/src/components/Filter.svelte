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
    width: 20%;
    display: inline-block;
    cursor: pointer;

    scroll-snap-align: start;
    transition-timing-function: linear;
  }
  /* .filter:hover {
    color: #ffc528;
    font-size: 18px;
  } */
  .active {
    color: #ffc528;
    font-size: 18px;
    font-family: 'Girassol', cursive;
  }
</style>

<div class='filter {isFocus ? 'active' : ''}' >
  {name}
</div>