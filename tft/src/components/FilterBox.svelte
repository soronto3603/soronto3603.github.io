<script>
  import Filter from './Filter.svelte'
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  export let names;
  export let activeArray = names.map(name => false);
  activeArray[2] = true;

  const offset = 75;
  function sender(event) {
    dispatch('message', {
      data: event.detail.data,
    });
  }

  function scrollHandler(a) {
    var w = window.innerWidth / 5;
    const target = Math.round(a.target.scrollLeft / w) + 2
    if (!target) {
      return;
    }
    activeArray = activeArray.map(x => false)
    activeArray[target] = true;
    dispatch('message', {
      data: names[target],
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
    width: 100vw;

    position: absolute;
    top: 50px;
    left:0px;
    color: #7d7d7d;

    font-size: 8px;
    line-height: 40px;

    scroll-snap-type: x mandatory;
  }

  .body * {
    scroll-snap-align: start;
  }

  .box div{
    display: inline-block;
  }
  .marginBox {
    width: 20vw;
  }
  .marginBox2 {
    width: 10vw;
  }
</style>

<div class="box" on:scroll={scrollHandler} on:mousedown={mousedownHandler}>
  {#each ['', '', ...names, '', ''] as name, index}
    <Filter name={name} bind:isFocus={activeArray[index]} on:message={sender} />
  {/each}
</div>