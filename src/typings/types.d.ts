
type Pokemon = {name: string; types: TypeName[]; url: URL;}[]
type PokemonWithoutTypes = {name: string; url: URL;}[]
type TypeName = "normal" | "fighting" | "flying" | "poison" | "ground" | "rock" | "bug" | "ghost" | "steel" | "fire" | "water" | "grass" | "electric" | "psychic" | "ice" | "dragon" | "dark" | "fairy"
type SortName = "ascending" | "descending" | "byType"
type Types = [TypeName, string][]
type Filter = Map<TypeName, boolean>
type Sort = Map<SortName, boolean>
interface ModalData {
    name: string;
    base_experience: number;
    height: number;
    weight: number;
    forms: {name: string, url: URL}[];
    abilities: {ability: {name: string, url: URL}}[];
    types: {type: {name: TypeName, url: URL}}[];
    stats: {base_stat: number; stat: {name: string, url: URL}}[];
}