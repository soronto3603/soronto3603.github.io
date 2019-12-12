<script>
  export let nextFunc;
  export let prevFunc;
  export let page;
  export let length;

  function range(start, end) {
    return (new Array(end - start + 1)).fill(undefined).map((_, i) => i + start);
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
    width: 70px;
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

<div>
  {#each range(1, (length || 1)) as n}
    <div>{n}</div>
  {/each}
</div>