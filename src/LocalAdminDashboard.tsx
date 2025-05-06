import { useEffect, useState } from "react";
import api from "./services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "./assets/logo.png";

interface Bruker {
  _id: string;
  brukernavn: string;
  rolle: string;
}

interface Arbeidsordre {
  _id: string;
  tittel: string;
  beskrivelse: string;
  dato: string;
  varer?: any[];
}

interface Props {
  firmaId: string;
}

export default function LocalAdminDashboard({ firmaId }: Props) {
  const [brukere, setBrukere] = useState<Bruker[]>([]);
  const [arbeidsordre, setArbeidsordre] = useState<Arbeidsordre[]>([]);
  const [melding, setMelding] = useState("");
  const [nyBruker, setNyBruker] = useState({ brukernavn: "", passord: "", rolle: "bruker" });
  const [valgtTab, setValgtTab] = useState<"Brukere" | "Arbeidsordre">("Brukere");
  const [sok, setSok] = useState("");

  useEffect(() => {
    if (firmaId) {
      hentBrukere();
      hentArbeidsordre();
    }
  }, [firmaId]);

  const hentBrukere = async () => {
    try {
      const res = await api.get(`/user?firmaId=${firmaId}`);
      setBrukere(res.data);
    } catch (err) {
      console.error("Feil ved henting av brukere:", err);
    }
  };

  const hentArbeidsordre = async () => {
    try {
      const res = await api.post("/order/hent", { firmaId });
      setArbeidsordre(res.data);
    } catch (err) {
      console.error("Feil ved henting av arbeidsordre:", err);
    }
  };

  const opprettBruker = async () => {
    if (!nyBruker.brukernavn || !nyBruker.passord) {
      setMelding("❌ Du må fylle ut alle feltene");
      return;
    }
    try {
      await api.post("/user", { ...nyBruker, firmaId });
      setMelding("✅ Bruker opprettet");
      setNyBruker({ brukernavn: "", passord: "", rolle: "bruker" });
      hentBrukere();
    } catch (err) {
      setMelding("❌ Kunne ikke opprette bruker");
    }
  };

  const slettBruker = async (id: string) => {
    if (!confirm("Slette bruker?")) return;
    try {
      await api.delete(`/user/${id}`);
      hentBrukere();
    } catch (err) {
      setMelding("❌ Kunne ikke slette bruker");
    }
  };

  const slettOrdre = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne ordren?")) return;
    try {
      await api.delete(`/order/${id}`, { data: { firmaId } });
      setMelding("✅ Ordre slettet");
      hentArbeidsordre();
    } catch (err) {
      setMelding("❌ Kunne ikke slette ordre");
    }
  };

  const eksporterPDF = (ordre: Arbeidsordre) => {
    const doc = new jsPDF();
    const varer = ordre.varer || [];

    const imgProps = doc.getImageProperties(logo);
    const imgWidth = 40;
    const imgHeight = (imgProps.height / imgProps.width) * imgWidth;
    doc.addImage(logo, "PNG", 150, 10, imgWidth, imgHeight);

    doc.setFontSize(16);
    doc.text(`Ordre: ${ordre.tittel}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Varenummer", "Beskrivelse", "Antall", "Tidspunkt", "Eks. MVA", "Ink. MVA"]],
      body: varer.map((v: any) => [
        v.varenummer,
        v.beskrivelse,
        v.antall,
        new Date(v.tidspunkt).toLocaleString("no-NO"),
        `${v.totalEksMva?.toFixed(2) || "0.00"} kr`,
        `${v.totalInkMva?.toFixed(2) || "0.00"} kr`,
      ]),
    });

    const totalEks = varer.reduce((sum, v) => sum + (v.totalEksMva || 0), 0);
    const totalInk = varer.reduce((sum, v) => sum + (v.totalInkMva || 0), 0);

    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total eks. MVA: ${totalEks.toFixed(2)} kr`, 190, y, { align: "right" });
    doc.text(`Total inkl. MVA: ${totalInk.toFixed(2)} kr`, 190, y + 6, { align: "right" });

    doc.save(`Ordre_${ordre.tittel.replace(/\s+/g, "_")}.pdf`);
  };

  if (!firmaId) {
    return <div className="p-4 text-red-500">❌ Mangler firmaId – kunne ikke laste data.</div>;
  }

  const filtrerteOrdre = arbeidsordre.filter((ao) =>
    ao.tittel?.toLowerCase().includes(sok.toLowerCase()) ||
    ao.beskrivelse?.toLowerCase().includes(sok.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4 border-b pb-2">
        {(["Brukere", "Arbeidsordre"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setValgtTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 ${
              valgtTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {valgtTab === "Brukere" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">👤 Opprett ny bruker</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                placeholder="Brukernavn"
                value={nyBruker.brukernavn}
                onChange={(e) => setNyBruker({ ...nyBruker, brukernavn: e.target.value })}
                className="border p-2 rounded w-full"
              />
              <input
                placeholder="Passord"
                type="password"
                value={nyBruker.passord}
                onChange={(e) => setNyBruker({ ...nyBruker, passord: e.target.value })}
                className="border p-2 rounded w-full"
              />
              <select
                value={nyBruker.rolle}
                onChange={(e) => setNyBruker({ ...nyBruker, rolle: e.target.value })}
                className="border p-2 rounded w-full"
              >
                <option value="bruker">Bruker</option>
                <option value="localadmin">Lokal admin</option>
              </select>
              <button
                onClick={opprettBruker}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Opprett
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">📋 Brukerliste</h3>
            <ul className="space-y-1">
              {brukere.map((b) => (
                <li
                  key={b._id}
                  className="flex justify-between items-center border-b py-1"
                >
                  <span>
                    {b.brukernavn} <span className="text-sm text-gray-500">({b.rolle})</span>
                  </span>
                  <button
                    onClick={() => slettBruker(b._id)}
                    className="text-sm text-red-600 underline"
                  >
                    ❌ Slett
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {valgtTab === "Arbeidsordre" && (
        <div className="bg-white p-4 rounded shadow space-y-4">
          <input
            type="text"
            placeholder="🔍 Søk på arbeidsordre..."
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            className="border p-2 rounded w-full"
          />

          {filtrerteOrdre.length > 0 ? (
            <ul className="space-y-2">
              {filtrerteOrdre.map((ao) => (
                <li
                  key={ao._id}
                  className="p-3 border rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-medium">{ao.tittel}</div>
                    <div className="text-sm text-gray-500">
                      Dato: {new Date(ao.dato).toLocaleDateString("no-NO")}
                    </div>
                    <div className="text-sm text-gray-600 italic">{ao.beskrivelse}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => eksporterPDF(ao)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      📄 PDF
                    </button>
                    <button
                      onClick={() => slettOrdre(ao._id)}
                      className="text-sm text-red-600 underline"
                    >
                      ❌ Slett
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">Ingen arbeidsordre funnet.</p>
          )}

          {melding && <p className="text-blue-600 text-sm">{melding}</p>}
        </div>
      )}
    </div>
  );
}
