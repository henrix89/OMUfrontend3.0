// 📁 /src/OrderDashboard.tsx

import { useEffect, useState, useRef } from "react";
import api from "./services/api";
import OrdreDetaljerModal from "./OrdreDetaljerModal";

interface Ordre {
  _id: string;
  ordreId?: string;
  tittel: string;
  beskrivelse?: string;
  dato: string;
}

interface Props {
  firmaId: string;
}

export default function OrderDashboard({ firmaId }: Props) {
  const [ordre, setOrdre] = useState<Ordre[]>([]);
  const [tittel, setTittel] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [melding, setMelding] = useState("");
  const [aktivOrdreId, setAktivOrdreId] = useState<string | null>(null);

  const hentOrdre = async () => {
    try {
      const res = await api.post("/order/hent", { firmaId });
      setOrdre(res.data);
    } catch (err) {
      console.error("Feil ved henting av ordre:", err);
    }
  };

  const opprettOrdre = async () => {
    try {
      const res = await api.post("/order", { firmaId, tittel, beskrivelse });
      setMelding("✅ Ordre opprettet");
      setTittel("");
      setBeskrivelse("");
      hentOrdre();
    } catch (err: any) {
      setMelding(`❌ Feil: ${err.response?.data?.message || "Ukjent feil"}`);
    }
  };

  const slettOrdre = async (id: string) => {
    if (!confirm("Slette denne ordren?")) return;
    try {
      await api.delete(`/order/${id}`, { data: { firmaId } });
      setMelding("✅ Ordre slettet");
      hentOrdre();
    } catch (err: any) {
      setMelding(`❌ Feil: ${err.response?.data?.message || "Ukjent feil"}`);
    }
  };

  useEffect(() => {
    hentOrdre();
  }, [firmaId]);

  return (
    <div className="theme-card">
      <h2>📦 Arbeidsordre</h2>

      <h3>➕ Opprett ny ordre</h3>
      <input placeholder="Tittel" value={tittel} onChange={(e) => setTittel(e.target.value)} />
      <input placeholder="Beskrivelse" value={beskrivelse} onChange={(e) => setBeskrivelse(e.target.value)} />
      <button onClick={opprettOrdre}>Opprett</button>

      <h3>📋 Ordreliste</h3>
      {ordre.length > 0 ? (
        <ul>
          {ordre.map((o) => (
            <li key={o._id}>
              <strong>{o.tittel}</strong> ({new Date(o.dato).toLocaleDateString()})
              <button onClick={() => setAktivOrdreId(o._id)} style={{ marginLeft: "10px" }}>
                Vis detaljer
              </button>
              <button onClick={() => slettOrdre(o._id)} style={{ marginLeft: "10px", color: "red" }}>
                Slett
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontStyle: "italic", color: "gray" }}>Ingen ordre enda</p>
      )}

      {melding && <p style={{ marginTop: "1rem" }}>{melding}</p>}

      {/* 🔍 Vis modal hvis valgt ordre */}
      {aktivOrdreId && (
        <OrdreDetaljerModal
          ordreId={aktivOrdreId}
          onClose={() => setAktivOrdreId(null)}
        />
      )}
    </div>
  );
}
