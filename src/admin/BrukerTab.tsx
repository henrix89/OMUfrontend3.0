// src/admin/BrukerTab.tsx
import { useEffect, useState } from "react";
import api from "../services/api";

interface Bruker {
  _id: string;
  brukernavn: string;
  rolle: string;
}

export default function BrukerTab({ firmaId }: { firmaId: string }) {
  const [brukere, setBrukere] = useState<Bruker[]>([]);
  const [nyBruker, setNyBruker] = useState({ brukernavn: "", passord: "", rolle: "bruker" });
  const [melding, setMelding] = useState("");

  useEffect(() => {
    hentBrukere();
  }, [firmaId]);

  const hentBrukere = async () => {
    try {
      const res = await api.get(`/user?firmaId=${firmaId}`);
      setBrukere(res.data);
    } catch {
      setMelding("❌ Kunne ikke hente brukere");
    }
  };

  const opprettBruker = async () => {
    try {
      const res = await api.post("/user", {
        firmaId,
        brukernavn: nyBruker.brukernavn.trim(),
        passord: nyBruker.passord,
        rolle: nyBruker.rolle,
      });
      if (res.status === 200 || res.status === 201) {
        setMelding("✅ Bruker opprettet");
        setNyBruker({ brukernavn: "", passord: "", rolle: "bruker" });
        hentBrukere();
      }
    } catch (err: any) {
      setMelding(`❌ Feil: ${err.response?.data?.message || "Ukjent feil"}`);
    }
  };

  const slettBruker = async (id: string) => {
    if (!confirm("Slette denne brukeren?")) return;
    try {
      await api.delete(`/user/${id}`);
      setMelding("✅ Bruker slettet");
      hentBrukere();
    } catch {
      setMelding("❌ Kunne ikke slette bruker");
    }
  };

  const endrePassord = async (id: string) => {
    const nytt = prompt("Nytt passord?");
    if (!nytt) return;
    try {
      await api.patch(`/user/${id}/passord`, { nyttPassord: nytt });
      setMelding("✅ Passord oppdatert");
    } catch {
      setMelding("❌ Feil ved oppdatering");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Brukere</h2>
      <ul className="space-y-1">
        {brukere.map((b) => (
          <li key={b._id} className="flex justify-between items-center p-2 bg-white rounded shadow">
            <div>👤 {b.brukernavn} – {b.rolle}</div>
            <div className="flex gap-2">
              <button onClick={() => slettBruker(b._id)} className="text-red-600 text-sm">Slett</button>
              <button onClick={() => endrePassord(b._id)} className="text-blue-600 text-sm">Endre passord</button>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="pt-4 font-medium">➕ Opprett ny bruker</h3>
      <input
        className="border p-2 rounded w-full"
        placeholder="Brukernavn"
        value={nyBruker.brukernavn}
        onChange={(e) => setNyBruker({ ...nyBruker, brukernavn: e.target.value })}
      />
      <input
        className="border p-2 rounded w-full"
        placeholder="Passord"
        type="password"
        value={nyBruker.passord}
        onChange={(e) => setNyBruker({ ...nyBruker, passord: e.target.value })}
      />
      <select
        className="border p-2 rounded w-full"
        value={nyBruker.rolle}
        onChange={(e) => setNyBruker({ ...nyBruker, rolle: e.target.value })}
      >
        <option value="bruker">Bruker</option>
        <option value="localadmin">Lokal admin</option>
      </select>

      <button
        onClick={opprettBruker}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Opprett bruker
      </button>

      {melding && <p className="text-sm text-center text-gray-700">{melding}</p>}
    </div>
  );
}
