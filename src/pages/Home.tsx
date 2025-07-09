import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import WorkCalendar from "../components/calendar/WorkCalendar";
import type { WorkEntry } from "../components/calendar/WorkCalendar";

export default function Home() {
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
