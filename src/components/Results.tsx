import { useRef } from 'react'
import { addClass, removeClass, sortArr } from '../utils'
import Pokemon from './Pokemon'

export default function Results({areFiltersApplied, checkedSort, checkedTypes, favourites, filter, getAlias, isDataFetched, openModal, pokemon, toggleFavourite}:
{
    areFiltersApplied: boolean;
    checkedSort: SortName[];
    checkedTypes: TypeName[];
    favourites: number[];
    filter: Filter;
    getAlias: (name: TypeName) => string;
    isDataFetched: boolean;
    openModal: (id: number, url: URL) => void;
    pokemon: Pokemon;
    sort: Sort;
    toggleFavourite: (id: number) => void;
}) {
    const sectionRef = useRef<HTMLElement>(null)

    const $pokemonElement = ({id, name, url}: {id: number; name: string; url: URL}) => {
        return <Pokemon
            key={id}
            id={id}
            isFavourite={favourites.includes(id)}
            name={name}
            openModal={openModal}
            toggleFavourite={toggleFavourite}
            url={url}
        />
    }
    const $pokemonElements = (matches: Pokemon) => matches.map(match => $pokemonElement(match))

    // create React elements for Pokemon characters
    /* applyControls function is never invoked when sectionRef has initial value of null,
       so it's safe to exclude null type for sectionRef.current when removing class inside the function */
    const $applyControls = () => {
        addClass(sectionRef.current!, "pokemon")
        const availableTypes = areFiltersApplied ? checkedTypes : [...filter.keys()]
        let data: Pokemon = areFiltersApplied
            ? structuredClone(pokemon).filter(({types}: {types: TypeName[]}) => checkedTypes.every(type => types.includes(type)))
            : structuredClone(pokemon)
        
        // if no results match filter(s) applied; array is empty, dummy element is returned
        if (!!!data.length) {
            removeClass(sectionRef.current!, "pokemon")
            return <h2 className="no-results">{`¯\\_(ツ)_/¯`}</h2>
        }

        // sorting elements
        let order = 0  // 0: value not yet determined or no order specified, 1: alphabetically ascending, -1: alphabetically descending
        if(checkedSort.includes('ascending')) {
            order = 1
            data.sort(({name: a}, {name: b}) => a > b ? 1 : a < b ? -1 : 0)
        }
        else if(checkedSort.includes('descending')) {
            order = -1
            data.sort(({name: a}, {name: b}) => a > b ? -1 : a < b ? 1 : 0)
        }
        if(!!!checkedSort.includes('byType')) return $pokemonElements(data)
        /* sorting by type
        if no type is checked in filters, then data includes all types.
        types to be sorted alphabetically in ascending or descending order as well if the respective option is checked */
        else {
            removeClass(sectionRef.current!, "pokemon")
            // sorting available types
            if(order === 1) sortArr(availableTypes, 'asc', 'alias')
            else if(order === -1) availableTypes.sort((a, b) => a > b ? -1 : a < b ? 1 : 0)
            // filtering pokemon by type and constructing pokemon elements
            return availableTypes.reduce((elements: JSX.Element[], type: TypeName) => {
                const matches = data.filter(({types}) => types.includes(type))
                return (matches.length
                    ? [...elements,
                        <div key={type} className="type-group">
                            <h2 className="type-group-title">{getAlias(type)}</h2>
                            <div className="pokemon">{$pokemonElements(matches)}</div>
                        </div>]
                    : elements
                )
            }, [])
        }
    }

    return (
        <section ref={sectionRef}>
            {isDataFetched ? $applyControls() : <div className="loading">Laden...</div>}
        </section>
    )
}