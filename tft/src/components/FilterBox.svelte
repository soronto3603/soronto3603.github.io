<script>
  import Filter from './Filter.svelte'
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  export let names;
  export let activeArray = names.map(name => false);
  activeArray[2] = true;

  const offset = 75;
  // function sender(event) {
  //   dispatch('message', {
  //     data: event.detail.data,
  //   });
  // }

  function scrollHandler(event) {
    const w = document.getElementById('filterBox').clientWidth / 5;
    const target = Math.round(event.target.scrollLeft / w) + 2;

    if (!target) {
      return;
    }
    activeArray = activeArray.map(x => false)
    activeArray[target] = true;
    dispatch('message', {
      data: names[Math.round(event.target.scrollLeft / w)],
    });
  }
  function mousedownHandler(a) {
    // console.log(a)
  }
</script>

<style>
  .box {
    overflow-x: auto;
    white-space: nowrap;
    width: 100%;

    color: #7d7d7d;

    font-size: 8px;
    line-height: 40px;

    scroll-snap-type: x mandatory;
  }
</style>

<div id='filterBox' class="box" on:scroll={scrollHandler} on:mousedown={mousedownHandler}>
  {#each ['', '', ...names, '', ''] as name, index}
    <Filter name={name} bind:isFocus={activeArray[index]} />
  {/each}
</div>