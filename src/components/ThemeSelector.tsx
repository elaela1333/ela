import { Moon, Palette, Sun } from 'lucide-react';
import { useTheme, ThemeName } from '../contexts/ThemeContext';

interface ThemeOption {
  name: ThemeName;
  label: string;
  icon: JSX.Element;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    name: 'light',
    label: 'Jasny',
    icon: <Sun className="h-4 w-4" />,
    description: 'Jasny motyw z białym tłem i czarnym tekstem'
  },
  {
    name: 'dark',
    label: 'Ciemny',
    icon: <Moon className="h-4 w-4" />,
    description: 'Ciemny motyw z czarnym tłem i jasnymi elementami'
  },
  {
    name: 'current',
    label: 'Domyślny',
    icon: <Palette className="h-4 w-4" />,
    description: 'Domyślny ciemny motyw aplikacji'
  }
];

const ThemeSelector = () => {
  const { theme, setTheme, isCurrentThemeDark } = useTheme();
  
  return (
    <div className={`p-6 rounded-lg shadow-lg ${
      isCurrentThemeDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-medium mb-4 ${
        isCurrentThemeDark ? 'text-gray-100' : 'text-gray-900'
      }`}>
        <Palette className="h-5 w-5 inline mr-2" />
        Wybór motywu
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {themeOptions.map((option) => (
          <button
            key={option.name}
            onClick={() => setTheme(option.name)}
            className={`flex items-center p-3 rounded-md transition-colors ${
              theme === option.name
                ? isCurrentThemeDark 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-100 text-indigo-900'
                : isCurrentThemeDark
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <div className={`p-2 rounded-full mr-3 ${
              isCurrentThemeDark
                ? 'bg-gray-800'
                : 'bg-white'
            }`}>
              {option.icon}
            </div>
            <div className="text-left">
              <div className="font-medium">{option.label}</div>
              <div className={`text-xs ${
                isCurrentThemeDark
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}>
                {option.description}
              </div>
            </div>
            {theme === option.name && (
              <div className="ml-auto">
                <div className={`h-3 w-3 rounded-full ${
                  isCurrentThemeDark
                    ? 'bg-white'
                    : 'bg-indigo-600'
                }`}></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
