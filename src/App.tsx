import { useCallback, useEffect, useMemo,  useState } from 'react'
import { getCheckedKeys, getIdFromURL, sortArr } from './utils'

// Import components
import Controls from './components/Controls'
import DetailedView from './components/DetailedView'
import LoadMore from './components/LoadMore'
import Results from './components/Results'
import Theme from './components/Theme'

// Import styles
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

const path = `https://pokeapi.co/api/v2`
const limit = 50
const root = document.querySelector('html')

export default function App() {
	const [theme, setTheme] = useState(() => {
		const theme = localStorage.getItem('theme') || 'light'
		root?.setAttribute('theme', theme)
		return theme
	})
    const [allPokemon, setAllPokemon] = useState<Pokemon>([])
	const [activeControls, setActiveControls] = useState<ActiveControls>(() => ({keyword: false, favourites: false, filter: false, sort: false}))
	const [searchKeyword, setSearchKeyword] = useState('')
	const [favourites, setFavourites] = useState<number[]>(() => {
		const storedFavs = localStorage.getItem('favourites')
		return storedFavs ? JSON.parse(storedFavs) : []
	})
	const [types, setTypes] = useState<Types>([])
	const [filter, setFilter] = useState<Filter>(() => new Map([["normal", false], ["fighting", false], ["flying", false], ["poison", false], ["ground", false], ["rock", false], ["bug", false], ["ghost", false], ["steel", false], ["fire", false], ["water", false], ["grass", false], ["electric", false], ["psychic", false], ["ice", false], ["dragon", false], ["dark", false], ["fairy", false]]))
	const [sort, setSort] = useState<Sort>(() => new Map([['ascending', false], ['descending', false], ['byType', false]]))
	const [offset, setOffset] = useState<number>(0)
	const [modalData, setModalData] = useState<ModalData | null>(() => null)
	const [pokemonToOpenInModal, setPokemonToOpenInModal] = useState<{id: number | undefined, url: URL | undefined, isOpen: boolean}>(() => ({id: undefined, url: undefined, isOpen: false}))
    const isDataFetched = !!allPokemon.length
	const checkedTypes = useMemo(() => {
		const checkedKeys = getCheckedKeys<TypeName>(filter)
		setActiveControls(prev => ({...prev, filter: !!checkedKeys.length}))
		return checkedKeys
	}, [filter])
	const checkedSort = useMemo(() => {
		const checkedKeys = getCheckedKeys<SortName>(sort)
		setActiveControls(prev => ({...prev, sort: !!checkedKeys.length}))
		return checkedKeys
	}, [sort])
	// matching pokemon characters passed on to Results component for rendering
	const pokemon = useMemo(() => structuredClone((() => {
		// narrow down matches through filter by favourites
		const matches = activeControls.favourites ? allPokemon.filter(({id}) => favourites.some(favId => favId === id)) : allPokemon
		// further narrow down matches through search by keyword
		return (activeControls.keyword
			? matches.filter(({id, name, types}) =>
				name.includes(searchKeyword) || types.some(type => type.toString().includes(searchKeyword)) || id.toString().includes(searchKeyword)) 
			: matches)
	})()), [allPokemon, activeControls])
	
    // fetch pokemon characters and pokemon types at initial render
	useEffect(() => {
		const endPoint = [`/type`]
		const typeFetchArr: Promise<Response>[] = []
		const updatedTypes: [TypeName, string][] = []
		let updatedAllPokemon: PokemonWithoutTypes | Pokemon = []
		let allPokemonGroupedByType: {[type in TypeName]: {name: string; url: URL;}[]} | {} = {}
		fetch(`${path}${endPoint}`)
		.then(response => response.json())
		.then(({results: typesData}) => {
			typesData.forEach(({url}: {url: URL}) => typeFetchArr.push(fetch(url)))
			Promise.all(typeFetchArr)
			.then(responses => Promise.all(responses.map(response => response.json())))
			.then(data => data.map(({name, names, pokemon}: {
				name: TypeName;
				names: {language: {name: string; url: URL;}; name:string;}[];
				pokemon: {pokemon: {name: string; url: URL}}[];
			}) => {
                if(!!pokemon.length) {
					for (const {pokemon: {name, url}} of pokemon) {
						const id: number = getIdFromURL(url)
						// only new characters get added, duplicates are skipped
						!updatedAllPokemon.some(({id: pokemonId}) => pokemonId === id) 
							&& (updatedAllPokemon as PokemonWithoutTypes).push({id, name, url})
					}
                    // inserts array of two, first the type name, second the type alias in German, types with no pokemon get excluded
					updatedTypes.push([name, (names.find(({language}) => language.name == 'de')!).name])
					allPokemonGroupedByType = {...allPokemonGroupedByType, [name]: pokemon}
				}
			}))
			.finally(() => {
				sortArr(updatedAllPokemon, 'asc', 'id')
				addTypeToPokemon(updatedAllPokemon as Pokemon, updatedTypes, allPokemonGroupedByType)
				setAllPokemon(updatedAllPokemon as Pokemon)
				setTypes(updatedTypes)
			})
		})
		.catch(error => console.error(error))
	}, [])

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

	// theme
	const toggleTheme = useCallback(() => setTheme(prev => {
		const updatedTheme = prev === 'light' ? 'dark' : 'light'
		localStorage.setItem('theme', updatedTheme)
		root!.setAttribute('theme', updatedTheme)
		return updatedTheme
	}), [])

	// controls functions for filtering and sorting
	const applyFilter = useCallback((name: TypeName): void => setFilter(prev => structuredClone(prev).set(name, !prev.get(name))), [filter])
	const getAlias = useCallback((name: TypeName): string => (types.find(([type]) => type === name)!)[1], [types])
	const handleSort = useCallback((name: SortName): void => {
		if(name === 'ascending') setSort(prev => structuredClone(prev).set(name, !prev.get(name)).set('descending', false))
		else if(name === 'descending') setSort(prev => structuredClone(prev).set(name, !prev.get(name)).set('ascending', false))
		else setSort(prev => structuredClone(prev).set(name, !prev.get(name)))
  	}, [sort])
	const updateOffset = useCallback((): void => {setOffset(prev => prev + limit)}, [])
	
	// results functions
	const toggleFavourite = (id: number) => {
		const updatedFavs = favourites.includes(id) ? favourites.filter(favId => favId !== id) : [...favourites, id]
		setFavourites(updatedFavs)
		localStorage.setItem('favourites', JSON.stringify(updatedFavs))
	}

	// modal functions for detailed view
	const openModal = useCallback((id: number, url: URL): void => setPokemonToOpenInModal({id, url, isOpen: true}), [pokemonToOpenInModal.id])

	return (
		<div className="App">
			<header>
				<img src='./pokémon_logo.svg' alt="Pokémon" width="272.7" height="100" />
				<Theme theme={theme} toggleTheme={toggleTheme} />	
			</header>
			<main>
				{useMemo(() => <Controls
					activeControls={activeControls}
					applyFilter={applyFilter}
					filter={filter}
					filterByKeyword={(keyword: string) => {setSearchKeyword(keyword); setActiveControls(prev => ({...prev, keyword: !!keyword}))}}
					handleSort={name => handleSort(name)}
					sort={sort}
					toggleFilterByFavourites={() => setActiveControls(prev => ({...prev, favourites: !prev.favourites}))}
					types={types}
				/>, [filter, sort, types, activeControls])}
				{useMemo(() => <Results
					areFiltersApplied={activeControls.filter}
					checkedSort={checkedSort}
					checkedTypes={checkedTypes}
					favourites={favourites}
					filter={filter}
					getAlias={getAlias}
					isDataFetched={isDataFetched}
					openModal={openModal}
					pokemon={pokemon.slice(0, limit + offset)}
					sort={sort}
					toggleFavourite={toggleFavourite}
				/>, [favourites, filter, offset, pokemon, searchKeyword, sort])}
				{isDataFetched && pokemon.length > offset + limit ? <LoadMore
					offset={offset}
					updateOffset={updateOffset}
				/> : <></>}
			</main>
			<footer>Probeaufgabe | Solongo</footer>
			{useMemo(() => <DetailedView modalData={modalData!} getAlias={getAlias} />, [modalData])}
		</div>
	)
}
