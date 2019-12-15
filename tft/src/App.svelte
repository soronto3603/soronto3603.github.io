<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Noto+Sans+KR&display=swap" rel="stylesheet">
	<meta name="viewport" content="width=device-width, user-scalable=no">
</svelte:head>

<script>
	import { onMount } from 'svelte';
	import { loadData, SYNERGIES } from './utils/store';
	import SynergyBox from './components/SynergyBox.svelte';
	import ChampionBox from './components/ChampionBox.svelte';
	import FilterBox from './components/FilterBox.svelte';
	import Pagination from './components/Pagination.svelte';

	export let combinations = [];
	export let currentCombinationsLength;
	export let synergy;
	export let page = 0;
	
	const banks = {}
	const PRINCIPAL = 'Light'

	onMount(async () => {
		synergy = 'Predator';
		reload();
	})

	async function handleMessage(event) {
		synergy = event.detail.data;
		page = 0;
		reload();
	}

	async function nextPage() {
		if ((page + 1) * 100 < currentCombinationsLength) {
			page += 1;
			reload();
		}
	}
	async function prevPage() {
		if (page !== 0) {
			page -= 1;
			reload();
		}
	}

	async function reload() {
		combinations = [...(await loadData(synergy)).slice(100 * page, 100 * page + 100)];
		currentCombinationsLength = (await loadData(synergy)).length
	}
</script>

<main>
	<FilterBox names={SYNERGIES} on:message={handleMessage} />
	<div class='synergyTitle'>6Light + {synergy}</div>
	<div>총 {currentCombinationsLength}개</div>
	<div class='table'>
		{#each combinations as synergy, index}
		<div class='line'>
			<div class='index'>{page * 100 + index + 1}</div>
			<div class='synergy'>
				<SynergyBox synergies={synergy.synergies} />
			</div>
			<div class='champions'>
				<ChampionBox champions={synergy.champions} />
			</div>
		</div>
		{/each}
	</div>
	<div class='arrow left' on:click={prevPage}>←</div>
	<div class='arrow right' on:click={nextPage}>→</div>
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
	.arrow {
		display: inline-block;
		width: 32px;
		height: 32px;
		border-radius: 16px;
		background-color: black;
		color: white;
		line-height: 32px;
    text-align: center;
		position: fixed;
		bottom: 60px;
	}
	
	@media screen and (min-width: 300px) { 
		.arrow.left {
			left: 10%;
		}
		.arrow.right {
			right: 10%;
		}
	}
	@media screen and (min-width: 769px) {
		.arrow.left {
			left: 20%;
		}
		.arrow.right {
			right: 20%;
		}
	}

	

	.synergyTitle {
		margin: 20px;
		margin-top:5px;
	}

	.table .index {
		width: 20px;
	}

	@media screen and (min-width: 300px) { 
		.table .synergy {
			width: 80%;
		}
	}
	@media screen and (min-width: 769px) {
		.table .synergy {
			width: 350px;
		}
	}
	
	@media screen and (min-width: 300px) { 
		.table .champions {
			display: block;
		}
	}
	@media screen and (min-width: 769px) {
		.table .champions {
			width: 400px;
		}
	}
	
	@media screen and (min-width: 300px) { 
		.table .line {
			display: block;
			height: 150px;
		}
	}
	@media screen and (min-width: 769px) {
		.table .line {
			display: block;
		}
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