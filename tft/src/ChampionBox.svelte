<script>
  import Champion from './Champion.svelte'
  export let champions;
</script>

<style>
  .championBox {
    position: relative;
    top:14px;
  }
  .length {
    display: inline-block;
    font-size: 8px;
    position: relative;
    top: -7px;
  }
</style>

<div class='championBox'>
  {#each champions as champion}
    <Champion name={champion} />
  {/each}
  <div class='length'>{champions.length}개</div>
</div>