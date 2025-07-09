import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import WorkCalendar from "../components/calendar/WorkCalendar";
import type { WorkEntry } from "../components/calendar/WorkCalendar";
import { useSidebar } from "../context/SidebarContext";

export default function Home() {
  const { toggleMobileSidebar } = useSidebar();
  const [entries, setEntries] = useState<WorkEntry[]>([]);

  const handleEntryChange = (newEntries: WorkEntry[]) => {
    setEntries(newEntries);
    console.log('Nouvelles entrées:', newEntries);
  };

  return (
    <>
      <PageMeta
        title="Calendrier de travail"
        description="Gérez vos heures de travail avec notre calendrier interactif"
      />
      
      {/* Bouton menu mobile */}
      <div className="lg:hidden mb-4">
        <button
          onClick={toggleMobileSidebar}
          className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2 4.75C2 4.33579 2.33579 4 2.75 4H17.25C17.6642 4 18 4.33579 18 4.75C18 5.16421 17.6642 5.5 17.25 5.5H2.75C2.33579 5.5 2 5.16421 2 4.75ZM2 10C2 9.58579 2.33579 9.25 2.75 9.25H17.25C17.6642 9.25 18 9.58579 18 10C18 10.4142 17.6642 10.75 17.25 10.75H2.75C2.33579 10.75 2 10.4142 2 10ZM2 15.25C2 14.8358 2.33579 14.5 2.75 14.5H17.25C17.6642 14.5 18 14.8358 18 15.25C18 15.6642 17.6642 16 17.25 16H2.75C2.33579 16 2 15.6642 2 15.25Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <WorkCalendar 
            entries={entries}
            onEntryChange={handleEntryChange}
          />
        </div>
      </div>
    </>
  );
}
