
type Pokemon = {name: string; types: TypeName[]; url: URL;}[]
type PokemonWithoutTypes = {name: string; url: URL;}[]
type TypeName = "normal" | "fighting" | "flying" | "poison" | "ground" | "rock" | "bug" | "ghost" | "steel" | "fire" | "water" | "grass" | "electric" | "psychic" | "ice" | "dragon" | "dark" | "fairy"
type SortName = "ascending" | "descending" | "byType"
type Types = [TypeName, string][]
type Filter = Map<TypeName, boolean>
type Sort = Map<SortName, boolean>
// type Filter = {[key in TypeName]: boolean;}
// type Sort = {[key in SortName]: boolean;}