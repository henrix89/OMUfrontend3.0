import { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";
import api from "./services/api";

interface JobOrder {
  _id: string;
  tittel: string;
  beskrivelse: string;
  dato: string;
  firmaRef: string;
}

interface JobblisteModalProps {
  onSelectJob: (jobId: string) => void;
  onClose: () => void;
}

export default function JobblisteModal({ onSelectJob, onClose }: JobblisteModalProps) {
  const { bruker } = useUser();
  const [jobbliste, setJobbliste] = useState<JobOrder[]>([]);
  const [nyTittel, setNyTittel] = useState("");
  const [nyBeskrivelse, setNyBeskrivelse] = useState("");

  const hentJobber = async () => {
    if (!bruker?.firmaId) return;
    try {
      const res = await api.post("/order/hent", { firmaId: bruker.firmaId });
      setJobbliste(res.data);
    } catch (err) {
      console.error("Feil ved henting av jobber:", err);
    }
  };

  const opprettNyJobb = async () => {
    if (!bruker?.firmaId || !nyTittel.trim()) return;
    try {
      await api.post("/order", {
        firmaId: bruker.firmaId,
        tittel: nyTittel,
        beskrivelse: nyBeskrivelse,
      });
      setNyTittel("");
      setNyBeskrivelse("");
      hentJobber();
    } catch (err) {
      console.error("Feil ved opprettelse av ny ordre:", err);
    }
  };

  useEffect(() => {
    if (bruker?.firmaId) hentJobber();
  }, [bruker]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Velg arbeidsordre</h3>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Tittel"
            value={nyTittel}
            onChange={(e) => setNyTittel(e.target.value)}
            className="border rounded px-3 py-1.5 flex-1 text-sm"
          />
          <input
            type="text"
            placeholder="Beskrivelse"
            value={nyBeskrivelse}
            onChange={(e) => setNyBeskrivelse(e.target.value)}
            className="border rounded px-3 py-1.5 flex-1 text-sm"
          />
          <button onClick={opprettNyJobb} className="bg-blue-600 text-white px-4 py-2 rounded">Opprett</button>
        </div>

        <ul className="space-y-3">
          {jobbliste.map((job) => (
            <li key={job._id} className="border p-4 rounded-lg shadow flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <p className="font-medium">{job.tittel}</p>
                <p className="text-sm text-gray-600">{job.beskrivelse}</p>
                <p className="text-xs text-gray-400">{new Date(job.dato).toLocaleString("no-NO")}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <button
                  onClick={() => {
                    onSelectJob(job._id);
                    onClose();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  VELG
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="text-right mt-6">
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">Lukk</button>
        </div>
      </div>
    </div>
  );
}
