<script>
  export let name;
</script>

<style>
  .champion {
    display: inline-block;
    float: left;
  }
  .champion img {
    width: 32px;
    height: 32px;
  }
</style>


<div class='champion'>
  <img alt={name} width=32 height=32 src='http://ddragon.leagueoflegends.com/cdn/9.22.1/img/champion/{name}.png' />
</div>