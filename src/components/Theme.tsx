import { sun, moon } from './icons'

const HeaderControls = ({theme, toggleTheme}: {
    theme: string;
    toggleTheme: () => void;
}) =>
    <button
        className="btn btn-primary theme-toggler"
        aria-label={theme === 'light' ? 'helles Thema' : 'dunkles Thema'}
        onClick={toggleTheme}
    >
        {theme === 'light' ? sun : moon}
    </button>

export default HeaderControls