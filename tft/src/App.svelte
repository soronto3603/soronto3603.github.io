<script>
	import { onMount } from 'svelte';
	import SynergyBox from './components/SynergyBox.svelte';
	import ChampionBox from './components/ChampionBox.svelte';
	import FilterBox from './components/FilterBox.svelte';

	export let synergies = [];
	export let keyword;
	export let synergyFilters = [];
	let constSynergies

	onMount(async () => {
		// const response = await fetch('../constances/light-synergies.json')
		const response = await fetch('https://soronto3603.github.io/tft/constances/light-synergies.json')
		constSynergies = await response.json()
		synergies = [...constSynergies]
		synergies.sort((a, b) => Object.keys(b.synergies).length - Object.keys(a.synergies).length)

		synergyFilters = synergies.reduce((p, c) => {
			for (const synergy of Object.keys(c.synergies)) {
				if (!p.includes(synergy)) {
					p.push(synergy)
				}
			}
			return p
		}, []).map((synergy) => ({
			name: synergy,
			isActive: false,
		}))
	})

	function handleMessage(event) {
		const target = synergyFilters.filter(synergy => synergy.name === event.detail.data)[0];
		target.isActive = !target.isActive;
		filteringSynergies()
	}

	function filteringSynergies() {
		let tempSynergies = [...constSynergies]
		synergyFilters.forEach(targetSynergy => {
			if (targetSynergy.isActive) {
				tempSynergies = tempSynergies.filter(synergy => Object.keys(synergy.synergies).includes(targetSynergy.name))
			}
		})
		synergies = [...tempSynergies]
	}
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
	<!-- <div class='search'>
		<input bind:value={keyword} />
		<button on:click={search}>search</button>
		<button on:click={searchInit}>init</button>
	</div> -->
	<FilterBox filters={synergyFilters} on:message={handleMessage} />
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