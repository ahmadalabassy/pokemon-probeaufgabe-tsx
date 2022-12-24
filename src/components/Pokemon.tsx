import { memo } from "react"
import { capitalize } from "../utils"

export default memo(function Pokemon({name, id, openModal}:
{
    name: string;
    id: string;
    openModal: (id: string, url: URL) => void;
}) {
    return (
        <div className="character" onClick={() => openModal} data-bs-toggle="modal" data-bs-target="#modal">
            <h2 className="character-name">{capitalize(name)}</h2>
            <img className="character-img" src={`./pokemon/${id}.svg`} alt={name}/>
            <p className="character-number">{id}</p>
        </div>
    )
})