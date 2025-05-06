import React, { useState, useEffect } from "react";

type Props = {
  verkstedId: string;
};

type Bruker = {
  brukernavn: string;
  passord: string;
  rolle: "admin" | "bruker";
  verkstedId: string;
};

type Vare = {
  id: string;
  navn: string;
  pris: number;
};

const AdminPanel: React.FC<Props> = ({ verkstedId }) => {
  const [brukere, setBrukere] = useState<Bruker[]>([]);
  const [nyBruker, setNyBruker] = useState("");
  const [nyttPassord, setNyttPassord] = useState("");
  const [rolle, setRolle] = useState<"admin" | "bruker">("bruker");

  const [varer, setVarer] = useState<Vare[]>([]);
  const [nyVareNavn, setNyVareNavn] = useState("");
  const [nyVarePris, setNyVarePris] = useState(0);

  // Hent brukere og varer for dette verkstedet
  useEffect(() => {
    const rawBrukere = localStorage.getItem("brukere") || "[]";
    const alleBrukere = JSON.parse(rawBrukere);
    const filtrerte = alleBrukere.filter((b: Bruker) => b.verkstedId === verkstedId);
    setBrukere(filtrerte);

    const varerFraLagring = JSON.parse(localStorage.getItem("varer_" + verkstedId) || "[]");
    setVarer(varerFraLagring);
  }, [verkstedId]);

  const leggTilBruker = () => {
    if (!nyBruker || !nyttPassord) return;

    const rawBrukere = localStorage.getItem("brukere") || "[]";
    const alleBrukere = JSON.parse(rawBrukere);

    const nyBrukerData: Bruker = {
      brukernavn: nyBruker,
      passord: nyttPassord,
      rolle,
      verkstedId,
    };

    const oppdatert = [...alleBrukere, nyBrukerData];
    localStorage.setItem("brukere", JSON.stringify(oppdatert));
    setBrukere(oppdatert.filter((b: Bruker) => b.verkstedId === verkstedId));

    setNyBruker("");
    setNyttPassord("");
    setRolle("bruker");
  };

  const leggTilVare = () => {
    if (!nyVareNavn || nyVarePris <= 0) return;

    const nyVare: Vare = {
      id: Date.now().toString(),
      navn: nyVareNavn,
      pris: nyVarePris,
    };

    const oppdatert = [...varer, nyVare];
    setVarer(oppdatert);
    localStorage.setItem("varer_" + verkstedId, JSON.stringify(oppdatert));

    setNyVareNavn("");
    setNyVarePris(0);
  };

  return (
    <div>
      <h2>Adminpanel for verksted: {verkstedId}</h2>

      <section>
        <h3>➕ Legg til bruker</h3>
        <input
          type="text"
          placeholder="Brukernavn"
          value={nyBruker}
          onChange={(e) => setNyBruker(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passord"
          value={nyttPassord}
          onChange={(e) => setNyttPassord(e.target.value)}
        />
        <select value={rolle} onChange={(e) => setRolle(e.target.value as "admin" | "bruker")}>
          <option value="bruker">Bruker</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={leggTilBruker}>Legg til</button>
      </section>

      <section>
        <h3>👥 Brukere</h3>
        <ul>
          {brukere.map((b, i) => (
            <li key={i}>
              {b.brukernavn} ({b.rolle})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>➕ Legg til vare</h3>
        <input
          type="text"
          placeholder="Varenavn"
          value={nyVareNavn}
          onChange={(e) => setNyVareNavn(e.target.value)}
        />
        <input
          type="number"
          placeholder="Pris"
          value={nyVarePris}
          onChange={(e) => setNyVarePris(parseFloat(e.target.value))}
        />
        <button onClick={leggTilVare}>Legg til vare</button>
      </section>

      <section>
        <h3>📦 Varer</h3>
        <ul>
          {varer.map((v) => (
            <li key={v.id}>
              {v.navn} – {v.pris} kr
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminPanel;
