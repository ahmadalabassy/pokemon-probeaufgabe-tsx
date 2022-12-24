
function removeClass(element: HTMLElement, cssClass: string): void {
    element && element.classList.remove(cssClass)
}

function addClass(element: HTMLElement, cssClass: string): void {
    element && element.classList.add(cssClass)
}

function getCheckedKeys<T>(map: Map<T, boolean>): T[] {
    return [...map.entries()].reduce((checkedoptions: T[], [key, value]: [T, boolean]) =>
        value ? checkedoptions.concat(key) : checkedoptions
    , [])
}

const capitalize = (name: string): string => name[0].toUpperCase() + name.substring(1)

export { addClass, removeClass, getCheckedKeys, capitalize }