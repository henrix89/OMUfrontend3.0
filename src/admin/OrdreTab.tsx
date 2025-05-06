import { useEffect, useState } from "react";
import api from "../services/api";

interface Ordre {
  _id: string;
  tittel: string;
  dato: string;
  varer: any[];
}

interface Props {
  firmaId: string; // dette må være firmaId, f.eks. "toyota"
}

export default function OrdreTab({ firmaId }: Props) {
  const [ordrer, setOrdrer] = useState<Ordre[]>([]);
  const [sok, setSok] = useState("");
  const [melding, setMelding] = useState("");

  useEffect(() => {
    if (firmaId) hentOrdrer();
  }, [firmaId]);

  const hentOrdrer = async () => {
    try {
      const res = await api.post("/order/hent", { firmaId });
      setOrdrer(res.data || []);
    } catch (err) {
      console.error("❌ Feil ved henting av ordre:", err);
    }
  };

  const filtrerteOrdre = ordrer.filter((o) =>
    o.tittel?.toLowerCase().includes(sok.toLowerCase())
  );

  const lastNedPdf = async (ordreId: string) => {
    try {
      const res = await api.get(`/order/ordre/${ordreId}`);
      const data = res.data;

      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Ordre: ${data.tittel || ordreId}`, 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [["Varenummer", "Beskrivelse", "Antall", "Tidspunkt", "Eks. MVA", "Ink. MVA"]],
        body: data.varer.map((v: any) => [
          v.varenummer,
          v.beskrivelse,
          v.antall,
          new Date(v.tidspunkt).toLocaleString("no-NO"),
          `${v.totalEksMva.toFixed(2)} kr`,
          `${v.totalInkMva.toFixed(2)} kr`,
        ]),
      });
      doc.save(`Ordre_${data.tittel || ordreId}.pdf`);
    } catch (err) {
      setMelding("❌ Klarte ikke generere PDF");
    }
  };

  const slettOrdre = async (ordreId: string) => {
    if (!confirm("Er du sikker på at du vil slette denne ordren?")) return;
    try {
      await api.delete(`/order/${ordreId}`);
      setMelding("✅ Ordre slettet");
      hentOrdrer();
    } catch (err) {
      setMelding("❌ Feil ved sletting");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">📋 Arbeidsordre</h2>

      <input
        type="text"
        value={sok}
        onChange={(e) => setSok(e.target.value)}
        placeholder="🔍 Søk på tittel"
        className="w-full p-2 border rounded"
      />

      {filtrerteOrdre.length > 0 ? (
        <ul className="space-y-2">
          {filtrerteOrdre.map((ordre) => (
            <li
              key={ordre._id}
              className="p-3 border rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="font-medium">{ordre.tittel}</div>
                <div className="text-sm text-gray-500">
                  Dato: {new Date(ordre.dato).toLocaleDateString("no-NO")}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => lastNedPdf(ordre._id)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => slettOrdre(ordre._id)}
                  className="text-sm text-red-600 underline"
                >
                  ❌ Slett
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">Ingen ordre funnet.</p>
      )}

      {melding && <p className="text-blue-600 text-sm">{melding}</p>}
    </div>
  );
}
