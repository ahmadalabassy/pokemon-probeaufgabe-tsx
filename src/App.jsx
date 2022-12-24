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
	const [pokemon, setPokemon] = useState([])
	const [types, setTypes] = useState([])
	const [allPokemonGroupedByType, setAllPokemonGroupedByType] = useState({})
	const [filter, setFilter] = useState({})
	const [sort, setSort] = useState(() => ({ascending: false, descending: false, byType: false}))
	const [offset, setOffset] = useState(0)
	const [modalData, setModalData] = useState(() => null)
	const [pokemonToOpenInModal, setPokemonToOpenInModal] = useState(() => ({id: null, url: null, isOpen: false}))
	const [isDataFetched, setIsDataFetched] = useState(() => false)

	// fetch pokemon characters and pokemon types at initial render
	useEffect(() => {
		const endPoints = [`/pokemon/?offset=${offset}&limit=${limit}`, `/type`]
		const fetchArr = endPoints.map(point => fetch(`${path}${point}`))
		const updatedTypes = []
		const typeFetchArr = []
		let updatedFilter = {}
		let updatedAllPokemonGroupedByType = {}
		let updatedPokemon
		Promise.all(fetchArr)
		.then(responses => Promise.all(responses.map(response => response.json())))
		.then(([{results: pokemonData}, {results: typesData}]) => {
			updatedPokemon = pokemonData
			typesData.forEach(({url}) => typeFetchArr.push(fetch(url)))
			Promise.all(typeFetchArr)
			.then(responses => Promise.all(responses.map(response => response.json())))
			.then(data => data.map(({name, names, pokemon}) => {
				// inserts array of two, first the type name, second the type alias in German, types with no pokemon get excluded
				if(!!pokemon.length) {
					updatedTypes.push([name, names.find(({language}) => language.name == 'de').name])
					updatedFilter = {...updatedFilter, [name]: false}
					updatedAllPokemonGroupedByType = {...updatedAllPokemonGroupedByType, [name]: pokemon}
				}
			}))
			.finally(() => {
				addTypeToPokemon(updatedPokemon, updatedTypes, updatedAllPokemonGroupedByType)
				setPokemon(updatedPokemon)
				setTypes(updatedTypes)
				setFilter(updatedFilter)
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

	const addTypeToPokemon = (pokemonArr, typesArr, groupsArr) => {
		pokemonArr.forEach(pokemon => {
		  typesArr.forEach(([type]) => {
			if(groupsArr[type].find(({pokemon: character}) => pokemon.name === character.name))
			  pokemon.types = pokemon.types ? [...pokemon.types, type] : [type]
		  })
		})
	}

	// fetch pokemon by id for detailed view
    useEffect(() => {
        const {url, id} = pokemonToOpenInModal
        if(!!id) fetch(url).then(response => response.json()).then(data => setModalData(data))
    }, [pokemonToOpenInModal.id])

	// controls functions for filtering and sorting
	const handleSort = name => {
		if(name === 'ascending') setSort(prev => ({...prev, [name]: !prev[name], descending: false}))
		else if(name === 'descending') setSort(prev => ({...prev, [name]: !prev[name], ascending: false}))
		else setSort(prev => ({...prev, [name]: !prev[name]}))
  	}
	const getAlias = name => types.find(([type]) => type === name)[1] 
	const updateOffset = () => setOffset(prev => prev + limit)
	
	// modal functions for detailed view
	const openModal = (id, url) => setPokemonToOpenInModal({id, url, isOpen: true})
    const closeModal = () => setPokemonToOpenInModal(prev => ({...prev, isOpen: false}))

	return (
		<div className="App">
			<header><img src='./pokémon_logo.svg' alt="Pokémon" width="272.7" height="100"/></header>
			<main>
				{useMemo(() => <Controls
					types={types}
					applyFilter={name => setFilter(prev => ({...prev, [name]: !prev[name]}))}
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
			{useMemo(() => pokemonToOpenInModal.isOpen && <DetailedView modalData={modalData} />, )}
			<footer>Probeaufgabe | Solongo</footer>
		</div>
	)
}
