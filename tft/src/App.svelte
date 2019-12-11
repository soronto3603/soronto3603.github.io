<script>
	import { onMount } from 'svelte';
	import SynergyBox from './SynergyBox.svelte';
	import ChampionBox from './ChampionBox.svelte';

	export let synergies = [];
	export let keyword;
	let constSynergies

	onMount(async () => {
		const response = await fetch('https://soronto3603.github.io/lolche/constances/light-synergies.json')
		constSynergies = await response.json()
		synergies = [...constSynergies]
		synergies.sort((a, b) => Object.keys(b.synergies).length - Object.keys(a.synergies).length)
	})

	function search() {
		synergies = synergies.filter(synergy => Object.keys(synergy.synergies).includes(keyword))
	}
	function searchInit() {
		synergies = [...constSynergies]
		synergies.sort((a, b) => Object.keys(b.synergies).length - Object.keys(a.synergies).length)
	}
</script>

<link href="https://fonts.googleapis.com/css?family=Noto+Sans+KR&display=swap" rel="stylesheet">

<main>
	<div class='title'>롤토체스 조합 검색기</div>
	<div class='subtitle'>6빛 조합</div>
	<div class='search'>
		<input bind:value={keyword} />
		<button on:click={search}>search</button>
		<button on:click={searchInit}>init</button>
	</div>
	<div class='example'>
		Light, Ocean, Shadow, Mystics, Avatar, Ranger, Blademaster, Wardner, Wind, Inferno, Poison, Glacial, Berserker, Electric
	</div>
	<div class='table'>
		{#each synergies as synergy, index}
		<div class='line'>
			<div class='index'>{index + 1}</div>
			<div class='synergy'>
				<SynergyBox synergies={synergy.synergies} />
			</div>
			<div class='champions'>
				<ChampionBox champions={synergy.champions} />
			</div>
		</div>
		{/each}
	</div>
	<p>Contact : soronto3603@gmail.com</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		font-family: 'Noto Sans KR', sans-serif;
	}

	.title {
		font-size: 24px;
		font-weight: bolder;
	}

	.subtitle {
		margin: 20px;
		margin-top:5px;
	}

	.example {
		font-size: 12px;
		color: #e9e9e9;
	}

	.table .index {
		width: 20px;
	}
	.table .synergy {
		width: 300px;
	}
	.table .champions {
		width: 400px;
	}
	.table .line {
		display: block;
	}

	.table .line div {
		display: inline-block;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>