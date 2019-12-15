<!-- @media (min-width:576px){.container{max-width:540px}}@media (min-width:768px){.container{max-width:720px}}@media (min-width:992px){.container{max-width:960px}}@media (min-width:1200px){.container{max-width:1140px}}. -->

<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Noto+Sans+KR&display=swap" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Girassol&display=swap" rel="stylesheet">
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
	const offset = 20;
	
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
		if ((page + 1) * offset < currentCombinationsLength) {
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
		combinations = [...(await loadData(synergy)).slice(offset * page, offset * page + offset)];
		currentCombinationsLength = (await loadData(synergy)).length
	}
</script>

<main>
	<div class='synergyTitle'>Light</div>
	<FilterBox names={SYNERGIES} on:message={handleMessage} />
	<div class='numberDescription'>총 {currentCombinationsLength}개</div>
	<div class='table'>
		{#each combinations as synergy, index}
		<div class='line'>
			<!-- <div class='index'>{page * 100 + index + 1}</div> -->
			<div class='synergy' style={Object.keys(synergy.synergies).length < 3? 'bottom:20px;' : ''}>
				<SynergyBox synergies={synergy.synergies} />
			</div>
			<div class='champions'>
				<ChampionBox champions={synergy.champions} />
			</div>
		</div>
		{/each}
	</div>
	<!-- <div class='arrow left' on:click={prevPage}>←</div>
	<div class='arrow right' on:click={nextPage}>→</div> -->
	<p>Contact : soronto3603@gmail.com</p>
</main>

<style>
	:global(body) {
		background-color: #333;
		color: #fff8e8;
	}
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		font-family: 'Noto Sans KR', sans-serif;
	}

	.numberDescription {
		text-align: right;
		font-size: 12px;
		margin-bottom: 10px;
		color: #a9a9a9;
	}

	.synergyTitle {
		background-color: #333;
		z-index: 10;
		margin-bottom: 40px;
	}

	.line {
		margin-bottom: 10px;
		background-color: #222;
		height: 95px;
	}

	.synergy {
		width: 100px;
		display: inline-block;
		position: relative;
    right: 10px;
	}

	.champions {
		width: 160px;
		display: inline-block;
	}
</style>