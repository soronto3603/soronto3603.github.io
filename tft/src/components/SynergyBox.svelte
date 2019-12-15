<script>
  import Synergy from './Synergy.svelte'
  export let synergies;
</script>

<style>
  .length {
    display: inline-block;
    font-size: 8px;
    position: relative;
    top: 9px;
    right: 5px;
  }
  .margin {
    width:20px;
    height:20px;
  }
</style>

<div>
  {#each Object.keys(synergies) as synergy}
    <Synergy name={synergy} tier={synergies[synergy]} />
  {/each}
  <!-- <div class='length'>{Object.keys(synergies).length}개</div> -->
</div>