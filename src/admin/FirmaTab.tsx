import { useEffect, useState } from "react";
import api from "../services/api";

interface Firma {
  _id: string;
  firmaId: string;
  navn: string;
}

interface Props {
  valgtFirmaId: string;
  onVelgFirma: (dbId: string, navn: string, firmaId: string) => void;
  onSlettFirma: (id: string) => void;
}

export default function FirmaTab({ valgtFirmaId, onVelgFirma, onSlettFirma }: Props) {
  const [firmaer, setFirmaer] = useState<Firma[]>([]);
  const [nyttFirma, setNyttFirma] = useState({ firmaId: "", navn: "" });
  const [melding, setMelding] = useState("");

  useEffect(() => {
    hentFirmaer();
  }, []);

  const hentFirmaer = async () => {
    try {
      const res = await api.get("/company");
      setFirmaer(res.data);
    } catch (err) {
      console.error("Feil ved henting av firmaer:", err);
      setMelding("❌ Klarte ikke å hente firmaer");
    }
  };

  const handleOpprettFirma = async () => {
    const firmaId = nyttFirma.firmaId.trim().toLowerCase();
    const navn = nyttFirma.navn.trim();
    try {
      const res = await api.post("/company", { firmaId, navn });
      if (res.status === 200 || res.status === 201) {
        setMelding("✅ Firma opprettet");
        setNyttFirma({ firmaId: "", navn: "" });
        hentFirmaer();
      }
    } catch (err: any) {
      setMelding(`❌ Feil: ${err.response?.data?.message || "Ukjent feil"}`);
    }
  };

  const handleVelgFirma = (id: string) => {
    const firma = firmaer.find(f => f._id === id);
    if (firma) {
      onVelgFirma(firma._id, firma.navn, firma.firmaId);
    }
  };

  const handleSlettFirma = async () => {
    if (!valgtFirmaId) return;
    try {
      const firma = firmaer.find(f => f._id === valgtFirmaId);
      if (!firma) return;

      await api.delete(`/company/${firma._id}`); // ✅ bruker _id
      setMelding("🗑️ Firma slettet");
      onSlettFirma(valgtFirmaId);
      hentFirmaer();
    } catch (err) {
      console.error("Feil ved sletting av firma:", err);
      setMelding("❌ Kunne ikke slette firma");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">🏢 Firmaoversikt</h2>

      <select
        value={valgtFirmaId}
        onChange={(e) => handleVelgFirma(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Velg firma for detaljer</option>
        {firmaer.map((firma) => (
          <option key={firma._id} value={firma._id}>
            {firma.navn} ({firma.firmaId})
          </option>
        ))}
      </select>

      <button
        onClick={handleSlettFirma}
        className="text-red-600 underline text-sm"
        disabled={!valgtFirmaId}
      >
        ❌ Slett valgt firma
      </button>

      <div className="space-y-2">
        <h3 className="font-medium mt-4">➕ Opprett nytt firma</h3>
        <input
          placeholder="Firma-ID"
          value={nyttFirma.firmaId}
          onChange={(e) => setNyttFirma({ ...nyttFirma, firmaId: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="Firmanavn"
          value={nyttFirma.navn}
          onChange={(e) => setNyttFirma({ ...nyttFirma, navn: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleOpprettFirma}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Opprett firma
        </button>
        {melding && <p className="text-sm text-blue-600">{melding}</p>}
      </div>
    </div>
  );
}
