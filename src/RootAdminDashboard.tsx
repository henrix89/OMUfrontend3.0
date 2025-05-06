import { useState } from "react";
import FirmaTab from "./admin/FirmaTab";
import BrukerTab from "./admin/BrukerTab";
import OrdreTab from "./admin/OrdreTab";

const TABS = ["Firma", "Brukere", "Arbeidsordre"];

export default function RootAdminDashboard() {
  const [valgtTab, setValgtTab] = useState("Firma");
  const [valgtFirmaDbId, setValgtFirmaDbId] = useState<string>(""); // Mongo _id
  const [valgtFirmaId, setValgtFirmaId] = useState<string>("");     // firmaId til API
  const [valgtFirmaNavn, setValgtFirmaNavn] = useState<string>("");

  return (
    <div className="app-container space-y-6">
      <div className="flex gap-4 border-b pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setValgtTab(tab)}
            className={`px-4 py-2 font-medium ${
              valgtTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {valgtFirmaNavn && (
        <div className="text-sm text-gray-600">
          🔧 Du jobber med: <strong>{valgtFirmaNavn}</strong>
        </div>
      )}

      {valgtTab === "Firma" && (
        <FirmaTab
          valgtFirmaId={valgtFirmaDbId}
          onVelgFirma={(dbId, navn, firmaId) => {
            setValgtFirmaDbId(dbId);
            setValgtFirmaId(firmaId);
            setValgtFirmaNavn(navn);
          }}
          onSlettFirma={(id) => {
            if (id === valgtFirmaDbId) {
              setValgtFirmaDbId("");
              setValgtFirmaId("");
              setValgtFirmaNavn("");
            }
          }}
        />
      )}

      {valgtTab === "Brukere" && valgtFirmaId && (
        <BrukerTab firmaId={valgtFirmaId} />
      )}
      {valgtTab === "Arbeidsordre" && valgtFirmaId && (
        <OrdreTab firmaId={valgtFirmaId} />
      )}

      {!valgtFirmaId && valgtTab !== "Firma" && (
        <p className="text-center text-sm text-gray-500">
          Velg et firma først fra Firma-fanen.
        </p>
      )}
    </div>
  );
}
