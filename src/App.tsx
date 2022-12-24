import { useMemo, useState, useEffect } from 'react'
import Controls from './components/Controls'
import DetailedView from './components/DetailedView'
import LoadMore from './components/LoadMore'
import Results from './components/Results'

// Import needed Bootstrap JS plugins
import { Dropdown, Modal } from 'bootstrap'

// Import styles
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

const path = `https://pokeapi.co/api/v2`
const limit = 150

export default function App() {  
    const [pokemon, setPokemon] = useState<Pokemon>([])
	const [types, setTypes] = useState<Types>([])
	const [allPokemonGroupedByType, setAllPokemonGroupedByType] = useState({})
	const [filter, setFilter] = useState<Filter>(() => new Map([["normal", false], ["fighting", false], ["flying", false], ["poison", false], ["ground", false], ["rock", false], ["bug", false], ["ghost", false], ["steel", false], ["fire", false], ["water", false], ["grass", false], ["electric", false], ["psychic", false], ["ice", false], ["dragon", false], ["dark", false], ["fairy", false]]))
	const [sort, setSort] = useState<Sort>(() => new Map([['ascending', false], ['descending', false], ['byType', false]]))
	const [offset, setOffset] = useState<number>(0)
	const [modalData, setModalData] = useState(() => ({}))
	const [pokemonToOpenInModal, setPokemonToOpenInModal] = useState<{id: string, url: URL | undefined, isOpen: boolean}>(() => ({id: '', url: undefined, isOpen: false}))
    const [isDataFetched, setIsDataFetched] = useState<boolean>(() => false)

    // fetch pokemon characters and pokemon types at initial render
	useEffect(() => {
		const endPoints = [`/pokemon/?offset=${offset}&limit=${limit}`, `/type`]
		const fetchArr = endPoints.map(point => fetch(`${path}${point}`))
		const updatedTypes: [TypeName, string][] = []
		const typeFetchArr: Promise<Response>[] = []
		let updatedAllPokemonGroupedByType: {}
		let updatedPokemon: Pokemon
		Promise.all(fetchArr)
		.then(responses => Promise.all(responses.map(response => response.json())))
		.then(([{results: pokemonData}, {results: typesData}]) => {
			updatedPokemon = pokemonData
			typesData.forEach(({url}: {url: URL}) => typeFetchArr.push(fetch(url)))
			Promise.all(typeFetchArr)
			.then(responses => Promise.all(responses.map(response => response.json())))
			.then(data => data.map(({name, names, pokemon}: {
				name: TypeName;
				names: {language: {name: string; url: URL;}; name:string;}[];
				pokemon: {pokemon: {name: string; url: URL}}[];
			}) => {
                if(!!pokemon.length) {
                    // inserts array of two, first the type name, second the type alias in German, types with no pokemon get excluded
					updatedTypes.push([name, (names.find(({language}) => language.name == 'de')!).name])
					updatedAllPokemonGroupedByType = {...updatedAllPokemonGroupedByType, [name]: pokemon}
				}
			}))
			.finally(() => {
				addTypeToPokemon(updatedPokemon, updatedTypes, updatedAllPokemonGroupedByType)
				setPokemon(updatedPokemon)
				setTypes(updatedTypes)
				setAllPokemonGroupedByType(updatedAllPokemonGroupedByType)
			})
		})
		.catch(error => console.error(error))
		.finally(() => setIsDataFetched(true))
	}, [])

    // fetch more pokemon characters when load more button is clicked
	useEffect(() => {
		if(offset >= limit) {
			fetch(`${path}/pokemon/?offset=${offset}&limit=${limit}`)
			.then(response => response.json())
			.then(({results}) => {
				setPokemon(prev => {
					addTypeToPokemon(results, types, allPokemonGroupedByType)
					return prev.concat(results)
				})
			})
		}
	}, [offset])
	
		// fetch pokemon by id for detailed view
		useEffect(() => {
			const {url, id} = pokemonToOpenInModal
			if(!!id) fetch(url!).then(response => response.json()).then(data => setModalData(data))
		}, [pokemonToOpenInModal.id])

	const addTypeToPokemon = (pokemonArr: Pokemon, typesArr: Types, groupsArr: any) => {
		pokemonArr.forEach(pokemon => {
		  typesArr.forEach(([type]) => {
			if(groupsArr[type].find(({pokemon: character}: {pokemon: { name: string; url: string; }}) => pokemon.name === character.name))
			  pokemon.types = pokemon.types ? [...pokemon.types, type] : [type]
		  })
		})
	}

	// controls functions for filtering and sorting
	const applyFilter = (name: TypeName): void => setFilter(prev => JSON.parse(JSON.stringify(prev)).set(name, !prev.get(name)))
	const handleSort = (name: SortName): void => {
		if(name === 'ascending') setSort(prev => JSON.parse(JSON.stringify(prev)).set(name, !prev.get(name)).set('descending', false))
		else if(name === 'descending') setSort(prev => JSON.parse(JSON.stringify(prev)).set(name, !prev.get(name)).set('ascending', false))
		else setSort(prev => JSON.parse(JSON.stringify(prev)).set(name, !prev.get(name)))
  	}
    const getAlias = (name: TypeName): string => (types.find(([type]) => type === name)!)[1]
	const updateOffset = (): void => {setOffset(prev => prev + limit)}
	
	// modal functions for detailed view
	const openModal = (id: string, url: URL): void => setPokemonToOpenInModal({id, url, isOpen: true})

	return (
		<div className="App">
			<header><img src='./pokémon_logo.svg' alt="Pokémon" width="272.7" height="100"/></header>
			<main>
				{useMemo(() => <Controls
					types={types}
					applyFilter={applyFilter}
					handleSort={handleSort}
					sort={sort}
					filter={filter}
				/>, [sort, filter])}
				{useMemo(() => <Results
					pokemon={pokemon}
					filter={filter}
					isDataFetched={isDataFetched}
					sort={sort}
					getAlias={getAlias}
					openModal={openModal}
				/>, [offset, filter, sort])}
				<LoadMore
					offset={offset}
					isDataFetched={isDataFetched}
					updateOffset={updateOffset}
				/>
			</main>
			{useMemo(() => pokemonToOpenInModal.isOpen ? <DetailedView modalData={modalData} /> : <></>, [pokemonToOpenInModal.id])}
			<footer>Probeaufgabe | Solongo</footer>
		</div>
	)
}