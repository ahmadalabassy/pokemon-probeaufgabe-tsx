const addClass = (element: HTMLElement, cssClass: string): void =>
    element && element.classList.add(cssClass)
const removeClass = (element: HTMLElement, cssClass: string): void =>
    element && element.classList.remove(cssClass)

const capitalize = (name: string): string => name[0].toUpperCase() + name.substring(1)

const getCheckedKeys = <T,>(map: Map<T, boolean>): T[] =>
    [...map.entries()].reduce((checkedoptions: T[], [key, value]: [T, boolean]) =>
        value ? checkedoptions.concat(key) : checkedoptions
    , [])

const getIdFromURL = (url: URL): number => parseInt(url.toString().split('//')[1].slice(0, -1).split('/').pop()!)

const sortArr = (arr: any[], type: 'asc' | 'desc', key: string | number | symbol): void => {switch (type) {
    case 'desc':
        key ? arr.sort(({[key]: a}, {[key]: b}) => a > b ? -1 : a < b ? 1 : 0)
            : arr.sort((a, b) => a > b ? -1 : a < b ? 1 : 0)
        return
    default:
        key ? arr.sort(({[key]: a}, {[key]: b}) => a > b ? 1 : a < b ? -1 : 0)
            : arr.sort((a, b) => a > b ? 1 : a < b ? -1 : 0)
}}

export { addClass, capitalize, getCheckedKeys, getIdFromURL, removeClass, sortArr }