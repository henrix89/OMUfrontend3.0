// 📁 /src/OrdreDetaljerModal.tsx

import { useEffect, useState } from "react";
import api from "./services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "./assets/logo.png";

interface Props {
  ordreId: string;
  onClose: () => void;
}

interface Vare {
  kode: string;
  antall: number;
  varenummer: string;
  beskrivelse: string;
  pris: number;
  totalInkMva: number;
}

interface OrdreDetaljer {
  _id: string;
  tittel: string;
  beskrivelse?: string;
  dato: string;
  varer: Vare[];
}

export default function OrdreDetaljerModal({ ordreId, onClose }: Props) {
  const [ordre, setOrdre] = useState<OrdreDetaljer | null>(null);
  const [feil, setFeil] = useState("");

  useEffect(() => {
    const hentOrdre = async () => {
      try {
        const res = await api.get(`/order/ordre/${ordreId}`);
        setOrdre(res.data);
      } catch (err) {
        console.error("Feil ved henting av ordre:", err);
        setFeil("Klarte ikke hente ordre");
      }
    };
    hentOrdre();
  }, [ordreId]);

  const lastNedPDF = () => {
    if (!ordre) return;

    const totalEksMva = ordre.varer.reduce((sum, v) => sum + v.pris * v.antall, 0);
    const totalInkMva = ordre.varer.reduce((sum, v) => sum + v.totalInkMva, 0);

    const doc = new jsPDF();
    doc.addImage(logo, "PNG", 14, 10, 50, 15);
    doc.setFontSize(16);
    doc.text(`Ordre: ${ordre.tittel}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Varenummer", "Beskrivelse", "Antall", "Pris/stk", "Total inkl. MVA"]],
      body: ordre.varer.map((v) => [
        v.varenummer,
        v.beskrivelse,
        v.antall,
        `${v.pris.toFixed(2)} kr`,
        `${v.totalInkMva.toFixed(2)} kr`
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.setFontSize(12);
    doc.text(`Total eks. MVA: ${totalEksMva.toFixed(2)} kr`, 14, finalY + 10);
    doc.text(`Total ink. MVA: ${totalInkMva.toFixed(2)} kr`, 14, finalY + 20);

    doc.save(`Ordre_${ordre.tittel}.pdf`);
  };

  if (!ordre) return <div className="theme-card">Laster...</div>;

  return (
    <div className="theme-card" style={{ marginTop: "2rem" }}>
      <h3>{ordre.tittel}</h3>
      <p>{ordre.beskrivelse}</p>
      <p><strong>Dato:</strong> {new Date(ordre.dato).toLocaleDateString()}</p>

      <table style={{ width: "100%", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Varenummer</th>
            <th>Beskrivelse</th>
            <th>Antall</th>
            <th>Pris</th>
            <th>Totalt (inkl. mva)</th>
          </tr>
        </thead>
        <tbody>
          {ordre.varer.map((v, idx) => (
            <tr key={idx}>
              <td>{v.varenummer}</td>
              <td>{v.beskrivelse}</td>
              <td>{v.antall}</td>
              <td>{v.pris.toFixed(2)} kr</td>
              <td>{v.totalInkMva.toFixed(2)} kr</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={lastNedPDF} style={{ marginTop: "1rem" }}>📄 Eksporter til PDF</button>
      <button onClick={onClose} style={{ marginTop: "1rem", marginLeft: "1rem" }}>Lukk</button>

      {feil && <p style={{ color: "red" }}>{feil}</p>}
    </div>
  );
}
