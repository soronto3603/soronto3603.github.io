<script>
  export let name;
  if (name === 'Woodland') {
    name = 'forest'
  }
  export let tier;
</script>

<style>
  .synergy {
    width: 32px;
    height: 32px;
    border-radius: 16px;
    display:inline-block;
    margin: 5px;
  }
  .tier3 {
    background-color: #ffb93b;
  }
  .tier2 {
    background-color: #92b1bd;
  }
  .tier1 {
    background-color: #ca9372;
  }
  .synergy img{
    -webkit-filter: brightness(0) invert(1);
    filter: brightness(0) invert(1);

    width: 18px;
    height: 18px;
    position: relative;
    top: 7px;
  }
</style>


<div class='synergy {tier === 3 ? 'tier3' : tier === 2 ? 'tier2' : 'tier1'}'>
  <img alt={name} src='https://cdn.lolchess.gg/images/tft/traiticons-darken/trait_icon_{name.toLowerCase()}.png' />
</div>

