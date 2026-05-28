import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import './left-panel.scss';
import ExercisesIcon from '../../assets/icons/exercises.svg';
import NotebookIcon from '../../assets/icons/notebook.svg';
import ProgramsIcon from '../../assets/icons/programs.svg';
import SettingsIcon from '../../assets/icons/settings.svg';
import MeasurementsIcon from '../../assets/icons/measurements.svg';
import AccountIcon from '../../assets/icons/my-account.svg';
import ActionManagerIcon from '../../assets/icons/action-manager.svg';

// Типы для вкладок
interface TabItem {
  id: string;
  label: string;
  icon: string; // можно расширить потом под React.ReactNode
  path: string;
}

// Верхние вкладки
const topTabs: TabItem[] = [
  { id: 'exercises', label: 'Упражнения', icon: ExercisesIcon, path: '/exercises' }, // нужно будет создать
  { id: 'training-programs', label: 'Программы', icon: ProgramsIcon, path: '/training-programs' }, // ← уже есть
  { id: 'weight-tracker', label: 'Замеры', icon: MeasurementsIcon, path: '/weight-tracker' }, // ← уже есть (вес)
  { id: 'notebook', label: 'Блокнот', icon: NotebookIcon, path: '/notebook' }, // нужно будет создать
  { id: 'settings', label: 'Настройки', icon: SettingsIcon, path: '/settings' }, // нужно будет создать
];

// Нижние вкладки
const bottomTabs: TabItem[] = [
  { id: 'myaccount', label: 'Мой аккаунт', icon: AccountIcon, path: '/my-account' }, // нужно будет создать
  { id: 'actionmanager', label: 'Управление действиями', icon: ActionManagerIcon, path: '/action-manager' }, // нужно будет создать
];

const LeftPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTabId, setActiveTabId] = useState<string>('exercises');

  // Отслеживаем изменение URL и обновляем активную вкладку
  useEffect(() => {
    const allTabs = [...topTabs, ...bottomTabs];
    const foundTab = allTabs.find(tab => tab.path === location.pathname);
    if (foundTab) {
      setActiveTabId(foundTab.id);
    }
  }, [location.pathname]);

  const handleTabClick = (tab: TabItem) => {
    setActiveTabId(tab.id);
    navigate(tab.path);
  };

  // Функция для рендера иконки 
  const renderIcon = (icon: any, tabId: string) => {
    return <img src={icon} alt={tabId} className="custom-icon" />;
  };

  return (
    <div className="left-panel">
      {/* Верхняя часть */}
      <div className="panel-top">
        {topTabs.map((tab) => (
          <div
            key={tab.id}
            className={`panel-tab top-tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleTabClick(tab);
              }
            }}
          >
            <div className="tab-icon">
              {renderIcon(tab.icon, tab.id)}
            </div>
            <span className="tab-label">{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Зеленая полосочка-разделитель */}
      <div className="green-divider" />

      {/* Нижняя часть с темно-серым фоном */}
      <div className="panel-bottom">
        {bottomTabs.map((tab) => (
          <div
            key={tab.id}
            className={`panel-tab bottom-tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleTabClick(tab);
              }
            }}
          >
            <div className="tab-icon">
              {renderIcon(tab.icon, tab.id)}
            </div>
            <span className="tab-label">{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftPanel;