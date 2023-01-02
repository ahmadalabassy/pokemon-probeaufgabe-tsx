import { useMemo } from 'react'
import { search, sliders, starFilled } from './icons'

const sortAliased: {name: SortName, alias: string}[] = [
    {name: 'ascending', alias: 'A → Z'},
    {name: 'descending', alias: 'Z → A'},
    {name: 'byType', alias: 'Nach Typ'}
]

export default function Controls({activeControls, applyFilter, filter, filterByKeyword, handleSort, sort, toggleFilterByFavourites, types}:
{
    activeControls: ActiveControls
    applyFilter: (name: TypeName) => void;
    filter: Filter
    filterByKeyword: (keyword: string) => void;
    handleSort: (name: SortName) => void;
    sort: Sort;
    toggleFilterByFavourites: () => void;
    types: Types;
}) {
    // create React elements for Pokemon types
    const $typeOptions = useMemo(() => types.map(([name, alias]) =>
        <div key={name} className="option">
            <input
                className="filter-checkbox"
                type="checkbox"
                checked={filter.get(name)}
                id={name}
                onChange={() => applyFilter(name)}
            ></input>
            <label className="filter-label" htmlFor={name}>{alias}</label>
        </div>
    ), [filter, types])
    
    const $sortOptions = useMemo(() => sortAliased.map(({name, alias}, index: number) =>
        <div key={index} className="option">
            <input
                className="sort-checkbox"
                type="checkbox"
                checked={sort.get(name)}
                id={name}
                onChange={() => handleSort(name)}
            ></input>
            <label className="sort-label" htmlFor={name}>{alias}</label>
        </div>
    ), [sort])

    return(
        <>
            <div className="main-controls-header">
                <div className="input-group searchbar">
                    <span
                        data-activity={activeControls.keyword ? 'active' : 'inactive'}
                        className="input-group-text"
                        id="search-icon"
                    >
                        {search}
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        id="search-input"
                        aria-label="Suche"
                        placeholder="Suche"
                        onChange={event => filterByKeyword(event.target.value.toLowerCase().trim())}
                    ></input>
                </div>
                <button
                    data-activity={activeControls.favourites ? 'active' : 'inactive'}
                    className="btn btn-primary favourites"
                    onClick={toggleFilterByFavourites}
                    aria-label="Fovoriten"
                >
                    {starFilled}
                </button>
                <button
                    data-activity={activeControls.filter || activeControls.sort ? 'active' : 'inactive'}
                    className="btn btn-primary settings"
                    data-bs-toggle="collapse"
                    data-bs-target="#filterAndSortControls"
                    aria-label="Einstellungen"
                    aria-expanded="false"
                    aria-controls="filterAndSortControls"
                >
                    {sliders}
                </button>
            </div>
            <div className="accordion collapse" id="filterAndSortControls">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingFilter">
                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#filter-options"
                            aria-expanded="false"
                            aria-controls="filter-options"
                        >
                            Filtern
                        </button>
                    </h2>
                    <div id="filter-options" className="accordion-collapse collapse" aria-labelledby="headingFilter" data-bs-parent=".controls">
                        <div className="accordion-body">{$typeOptions}</div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingSort">
                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#sort-options"
                            aria-expanded="false"
                            aria-controls="sort-options"
                        >
                            Sortieren
                        </button>
                    </h2>
                    <div id="sort-options" className="accordion-collapse collapse" aria-labelledby="headingSort" data-bs-parent=".controls">
                        <div className="accordion-body">{$sortOptions}</div>
                    </div>
                </div>
            </div>
        </>
    )
}