import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, AngleRightIcon, PlusIcon, CloseIcon } from '../../icons';

export type WorkEntry = {
  date: string; // ex: '2025-07-09'
  startTime?: string; // ex: '09:00'
  durationMinutes?: number;
  fullDay?: boolean;
  project?: string; // ex: 'Projet A'
};

type CalendarMode = 'month' | 'week' | 'day';

interface WorkCalendarProps {
  entries?: WorkEntry[];
  onEntryChange?: (entries: WorkEntry[]) => void;
}

const WorkCalendar: React.FC<WorkCalendarProps> = ({ 
  entries = [], 
  onEntryChange 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [isFullDay, setIsFullDay] = useState<boolean>(false);
  const [show24Hours, setShow24Hours] = useState<boolean>(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (mode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (mode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setMode('day');
  };

  // Génération des dates
  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Obtenir le lundi de la première semaine du mois
    const startDate = new Date(firstDay);
    const day = firstDay.getDay();
    const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1); // Lundi = 1, Dimanche = 0
    startDate.setDate(diff);
    
    const dates = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || dates.length < 42) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    
    // Obtenir le lundi de la semaine
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi = 1, Dimanche = 0
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const getDayDates = () => {
    return [currentDate];
  };

  const getHours = () => {
    const hours = [];
    const startHour = show24Hours ? 0 : 6;
    const endHour = show24Hours ? 23 : 20;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      hours.push(hour);
    }
    
    return hours;
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getEntriesForHour = (hour: number) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return entries.filter(entry => {
      if (entry.date !== dateStr) return false;
      if (entry.fullDay) return true;
      
      if (entry.startTime) {
        const startHour = parseInt(entry.startTime.split(':')[0]);
        const endHour = startHour + Math.floor((entry.durationMinutes || 0) / 60);
        return hour >= startHour && hour < endHour;
      }
      
      return false;
    });
  };

  const getDates = () => {
    switch (mode) {
      case 'month':
        return getMonthDates();
      case 'week':
        return getWeekDates();
      case 'day':
        return getDayDates();
      default:
        return getMonthDates();
    }
  };

  // Gestion des clics
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    if (mode === 'month') {
      // En mode mois, on passe en mode semaine
      setCurrentDate(date);
      setMode('week');
    } else if (mode === 'week') {
      // En mode semaine, on passe en mode jour
      setCurrentDate(date);
      setMode('day');
      setSelectedDate(dateStr);
    }
  };

  const handleHourClick = (hour: number) => {
    setSelectedTime(`${hour.toString().padStart(2, '0')}:00`);
    setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleAddEntry = () => {
    if (!selectedDate) return;
    
    // Calculer la durée en minutes
    let durationMinutes: number | undefined;
    if (!isFullDay && selectedTime && endTime) {
      const start = new Date(`2000-01-01T${selectedTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }
    
    const newEntry: WorkEntry = {
      date: selectedDate,
      startTime: isFullDay ? undefined : selectedTime,
      durationMinutes: isFullDay ? undefined : durationMinutes,
      fullDay: isFullDay,
      project: selectedProject || undefined,
    };
    
    const updatedEntries = [...entries, newEntry];
    onEntryChange?.(updatedEntries);
    
    // Reset form
    setSelectedTime('09:00');
    setEndTime('17:00');
    setIsFullDay(false);
    setSelectedProject('');
    setShowAddModal(false);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedTime('09:00');
    setEndTime('17:00');
    setIsFullDay(false);
    setSelectedProject('');
  };

  // Formatage
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getTitle = () => {
    switch (mode) {
      case 'month':
        return formatMonth(currentDate);
      case 'week':
        return formatWeek(currentDate);
      case 'day':
        return formatDay(currentDate);
      default:
        return formatMonth(currentDate);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const hasEntry = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.some(entry => entry.date === dateStr);
  };

  const isInSameWeek = (date1: Date, date2: Date) => {
    // Obtenir le lundi de la semaine pour chaque date
    const getMondayOfWeek = (date: Date) => {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lundi = 1, Dimanche = 0
      const monday = new Date(date);
      monday.setDate(diff);
      return monday;
    };
    
    const monday1 = getMondayOfWeek(date1);
    const monday2 = getMondayOfWeek(date2);
    
    return monday1.toDateString() === monday2.toDateString();
  };

  const isHoveredWeek = (date: Date) => {
    return hoveredDate && isInSameWeek(date, hoveredDate);
  };

  const isHoveredDay = (date: Date) => {
    return hoveredDate && date.toDateString() === hoveredDate.toDateString();
  };

  const dates = getDates();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {/* Mobile Header */}
        <div className="block md:hidden space-y-3">
          {/* Navigation and Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevious}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={goToNext}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <AngleRightIcon className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600"
            >
              Aujourd'hui
            </button>
          </div>
          
          {/* Title */}
          <h2 className="text-base font-semibold text-gray-800 dark:text-white text-center">
            {getTitle()}
          </h2>
          
          {/* Mode buttons */}
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setMode('month')}
              className={`px-2 py-1 text-xs rounded-lg ${
                mode === 'month' 
                  ? 'bg-brand-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setMode('week')}
              className={`px-2 py-1 text-xs rounded-lg ${
                mode === 'week' 
                  ? 'bg-brand-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setMode('day')}
              className={`px-2 py-1 text-xs rounded-lg ${
                mode === 'day' 
                  ? 'bg-brand-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              Jour
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <AngleRightIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {getTitle()}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600"
            >
              Aujourd'hui
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode('month')}
              className={`px-3 py-1 text-sm rounded-lg ${
                mode === 'month' 
                  ? 'bg-brand-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setMode('week')}
              className={`px-3 py-1 text-sm rounded-lg ${
                mode === 'week' 
                  ? 'bg-brand-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setMode('day')}
              className={`px-3 py-1 text-sm rounded-lg ${
                mode === 'day' 
                  ? 'bg-brand-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              Jour
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
                {mode === 'month' && (
          <div className="space-y-4">
            {/* Mobile: Vertical list of weeks */}
            <div className="block md:hidden space-y-2">
              {Array.from({ length: Math.ceil(dates.length / 7) }, (_, weekIndex) => {
                const weekDates = dates.slice(weekIndex * 7, (weekIndex + 1) * 7);
                const weekStart = weekDates[0];
                const weekEnd = weekDates[6];
                
                return (
                  <div key={weekIndex} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {weekDates.map((date, dayIndex) => (
                        <button
                          key={dayIndex}
                          onClick={() => handleDateClick(date)}
                          onMouseEnter={() => setHoveredDate(date)}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={`p-1 text-xs rounded transition-all duration-200 ${
                            isToday(date)
                              ? 'bg-brand-500 text-white'
                              : !isCurrentMonth(date)
                              ? 'text-gray-300 dark:text-gray-600'
                              : hasEntry(date)
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white'
                          } ${
                            isHoveredWeek(date) && isCurrentMonth(date)
                              ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50 dark:bg-blue-900/10'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {['L', 'M', 'M', 'J', 'V', 'S', 'D'][dayIndex]}
                            </span>
                            <span className="font-medium">
                              {date.getDate()}
                            </span>
                            {hasEntry(date) && (
                              <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5"></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Traditional grid */}
            <div className="hidden md:block">
              <div className="grid grid-cols-7 gap-1">
                {/* Week days header */}
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {dates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                      isToday(date)
                        ? 'bg-brand-500 text-white'
                        : !isCurrentMonth(date)
                        ? 'text-gray-300 dark:text-gray-600'
                        : hasEntry(date)
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white'
                    } ${
                      isHoveredWeek(date) && isCurrentMonth(date)
                        ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50 dark:bg-blue-900/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {date.getDate()}
                      {hasEntry(date) && (
                        <div className="w-1 h-1 bg-green-500 rounded-full ml-1"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Placeholder for month view */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">💡 Cliquez sur une semaine pour voir la vue détaillée</span>
              </div>
            </div>
          </div>
        )}

        {mode === 'week' && (
          <div className="space-y-4">
            {/* Mobile: Vertical list of days */}
            <div className="block md:hidden space-y-2">
              {dates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`w-full p-4 text-left rounded-lg transition-all duration-200 ${
                    isToday(date)
                      ? 'bg-brand-500 text-white'
                      : hasEntry(date)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white'
                  } ${
                    isHoveredDay(date)
                      ? 'ring-2 ring-orange-400 ring-opacity-50 bg-orange-50 dark:bg-orange-900/10'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className="text-xl font-bold">
                          {date.getDate()}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">
                          {date.toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasEntry(date) && (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                      <div className="text-gray-400 dark:text-gray-500">
                        <AngleRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop: Traditional grid */}
            <div className="hidden md:block">
              <div className="grid grid-cols-7 gap-1">
                {dates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={`p-4 text-center rounded-lg transition-all duration-200 ${
                      isToday(date)
                        ? 'bg-brand-500 text-white'
                        : hasEntry(date)
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white'
                    } ${
                      isHoveredDay(date)
                        ? 'ring-2 ring-orange-400 ring-opacity-50 bg-orange-50 dark:bg-orange-900/10'
                        : ''
                    }`}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-medium">
                      {date.getDate()}
                    </div>
                    {hasEntry(date) && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Placeholder for week view */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">📅 Cliquez sur un jour pour voir la timeline détaillée</span>
              </div>
            </div>
          </div>
        )}

        {mode === 'day' && (
          <div className="space-y-4">
            {/* Day view header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {formatDay(currentDate)}
              </h3>
              <button
                onClick={() => setShow24Hours(!show24Hours)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  show24Hours 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {show24Hours ? '6h-20h' : '24h'}
              </button>
            </div>

            {/* Timeline view */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="max-h-96 overflow-y-auto">
                {getHours().map((hour) => {
                  const hourEntries = getEntriesForHour(hour);
                  const isCurrentHour = new Date().getHours() === hour && 
                    new Date().toDateString() === currentDate.toDateString();
                  
                  return (
                    <div
                      key={hour}
                      className={`flex items-center border-b border-gray-100 dark:border-gray-700 ${
                        isCurrentHour ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      {/* Time label */}
                      <div className="w-16 p-3 text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                        {formatHour(hour)}
                      </div>
                      
                      {/* Content area */}
                      <div 
                        className="flex-1 p-3 min-h-[60px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => handleHourClick(hour)}
                      >
                        {hourEntries.length > 0 ? (
                          <div className="space-y-1">
                            {hourEntries.map((entry, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-green-100 dark:bg-green-900/30 rounded text-sm"
                              >
                                <span className="font-medium text-green-800 dark:text-green-400">
                                  {entry.fullDay 
                                    ? 'Journée complète' 
                                    : `${entry.startTime} (${entry.durationMinutes}min)`
                                  }
                                  {entry.project && ` - ${entry.project}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 dark:text-gray-500 text-sm">
                            Cliquez pour ajouter une entrée
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add entry button */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                              <button
                  onClick={() => {
                    setSelectedTime('09:00');
                    setEndTime('17:00');
                    setSelectedDate(currentDate.toISOString().split('T')[0]);
                    setShowAddModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Ajouter une entrée de travail
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Ajouter une entrée de travail
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Projet
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sélectionner un projet</option>
                  <option value="Projet A">Projet A</option>
                  <option value="Projet B">Projet B</option>
                  <option value="Projet C">Projet C</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Réunion">Réunion</option>
                  <option value="Formation">Formation</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fullDay"
                  checked={isFullDay}
                  onChange={(e) => setIsFullDay(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="fullDay" className="text-sm text-gray-700 dark:text-gray-300">
                  Journée complète
                </label>
              </div>

              {!isFullDay && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleAddEntry}
                className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkCalendar; 