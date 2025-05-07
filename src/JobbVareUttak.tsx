// Tailwind-oppryddet og komplett komponent for JobbVareUttak

import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useRef, useState } from "react";
import { useUser } from "./context/UserContext";
import logo from "./assets/logo.png";
import JobblisteModal from "./JobblisteModal";
import ManuellKorrigeringModal from "./ManuellKorrigeringModal";
import api from "./services/api";
import { Camera } from "lucide-react";

const MVA_SATS = 1.25;

interface Vare {
  varenummer: string;
  beskrivelse: string;
  pris: number;
  strekkode?: string;
}

interface VareMedAntall extends Vare {
  kode: string;
  antall: number;
  tidspunkt: string;
  prisEksMva: number;
  totalEksMva: number;
  totalInkMva: number;
}

type Handlekurv = Record<string, VareMedAntall[]>;

export default function JobbVareUttak({ mobilvisning, verkstedId }: { mobilvisning: boolean; verkstedId: string }) {
  const { bruker } = useUser();
  const [jobbId, setJobbId] = useState("");
  const [pdfTittel, setPdfTittel] = useState("");
  const [handlekurv, setHandlekurv] = useState<Handlekurv>({});
  const [varedata, setVaredata] = useState<Record<string, Vare>>({});
  const [visJobbModal, setVisJobbModal] = useState(false);
  const [visManuellModal, setVisManuellModal] = useState(false);
  const [redigeringsVare, setRedigeringsVare] = useState<VareMedAntall | null>(null);
  const [popup, setPopup] = useState("");
  const [skannetVare, setSkannetVare] = useState("");
  const [scanning, setScanning] = useState(false);
  const [visHandlekurv, setVisHandlekurv] = useState(true);

  const varer = jobbId && handlekurv[jobbId] ? handlekurv[jobbId] : [];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedRef = useRef<string>("");

  useEffect(() => {
    const hentVaredata = async () => {
      try {
        const res = await api.get("/vare");
        const varer = res.data;
        const record: Record<string, Vare> = {};
        varer.forEach((item: Vare) => {
          const key = item.strekkode?.toLowerCase().trim() || item.varenummer.toLowerCase().trim();
          record[key] = item;
        });
        setVaredata(record);
      } catch (err) {
        console.error("Feil ved henting av varedata:", err);
      }
    };
    hentVaredata();
    return () => stopScanning();
  }, []);

  const startScanning = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPopup("📵 Nettleseren din støtter ikke kamera.");
      return;
    }
    setScanning(true);
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => setPopup("🎥 Trykk for å aktivere kamera."));
        codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            const kode = result.getText().trim();
            if (kode && kode !== lastScannedRef.current) {
              lastScannedRef.current = kode;
              leggTilVare(kode);
              setTimeout(() => (lastScannedRef.current = ""), 1500);
            }
          }
          if (err && !(err instanceof NotFoundException)) console.warn("Feil ved skanning:", err);
        });
      }
    } catch (err) {
      setPopup("❌ Kamera-feil");
      setScanning(false);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    codeReaderRef.current?.reset();
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => (scanning ? stopScanning() : startScanning());

  const leggTilVare = (kode: string) => {
    if (!jobbId) return setPopup("❗ Velg en arbeidsordre");
    const k = kode.trim().toLowerCase();
    const info = varedata[k] || Object.values(varedata).find((v) => v.varenummer.toLowerCase() === k);
    if (!info) return setPopup("❌ Ukjent vare");
    const eksisterende = varer.find((v) => v.kode === k);
    const antall = eksisterende ? eksisterende.antall + 1 : 1;
    const nyVare: VareMedAntall = {
      kode: k,
      antall,
      tidspunkt: new Date().toISOString(),
      varenummer: info.varenummer,
      beskrivelse: info.beskrivelse,
      pris: info.pris,
      prisEksMva: info.pris,
      totalEksMva: info.pris * antall,
      totalInkMva: info.pris * antall * MVA_SATS,
    };
    const nyListe = eksisterende ? varer.map((v) => (v.kode === k ? nyVare : v)) : [...varer, nyVare];
    oppdaterHandlekurv(nyListe);
    setPopup(`✔️ Lagt til ${k}`);
    setTimeout(() => setPopup(""), 2000);
  };

  const oppdaterHandlekurv = async (nyListe: VareMedAntall[]) => {
    if (!jobbId || !bruker?.firmaId) return;
    setHandlekurv((prev) => ({ ...prev, [jobbId]: nyListe }));
    await api.put(`/order/${jobbId}`, { firmaId: bruker.firmaId, varer: nyListe });
  };

  const fjernVare = (kode: string) => {
    const nyListe = varer.filter((v) => v.kode !== kode);
    oppdaterHandlekurv(nyListe);
  };

  const lastNedPDF = () => {
    const doc = new jsPDF();
    doc.addImage(logo, "PNG", 14, 10, 50, 15);
    doc.setFontSize(16);
    doc.text(`Ordre: ${pdfTittel || jobbId}`, 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [["Varenummer","Beskrivelse","Antall","Tidspunkt","Eks. MVA","Ink. MVA"]],
      body: varer.map((v) => [
        v.varenummer,
        v.beskrivelse,
        v.antall,
        new Date(v.tidspunkt).toLocaleString("no-NO"),
        `${v.totalEksMva.toFixed(2)} kr`,
        `${v.totalInkMva.toFixed(2)} kr`,
      ]),
    });
    doc.save(`Ordre_${pdfTittel || jobbId}.pdf`);
  };

  const handleSelectJob = async (selectedJobId: string) => {
    try {
      const res = await api.get(`/order/ordre/${selectedJobId}`);
      const data = res.data;
      if (bruker?.firmaId && data.firmaId !== bruker.firmaId) {
        setPopup("❌ Du har ikke tilgang til denne ordren.");
        return;
      }
      setJobbId(selectedJobId);
      setPdfTittel(data.tittel || selectedJobId);
      setHandlekurv((prev) => ({ ...prev, [selectedJobId]: data.varer }));
    } catch (err) {
      setPopup("Feil ved valg av ordre");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      {scanning && (
        <video ref={videoRef} autoPlay playsInline muted className="w-full mb-4 rounded shadow" />
      )}
      {popup && <p className="text-center text-sm text-red-500 mb-4">{popup}</p>}

      <h1 className="text-2xl font-semibold text-center mb-4">
        {pdfTittel ? `Arbeidsordre: ${pdfTittel}` : "Ingen arbeidsordre valgt"}
      </h1>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 pl-10 pr-3 py-2 border rounded-lg"
          placeholder="Strekkode eller varenummer"
          value={skannetVare}
          onChange={(e) => setSkannetVare(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              leggTilVare(skannetVare);
              setSkannetVare("");
            }
          }}
        />
        <button onClick={toggleCamera} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          <Camera className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
          onClick={() => setVisJobbModal(true)}
        >
          Åpne arbeidsordre
        </button>
        <button
          className="w-full bg-gray-200 py-2 rounded-lg"
          onClick={() => setVisHandlekurv(!visHandlekurv)}
        >
          {visHandlekurv ? "Skjul handlekurv" : "Vis handlekurv"}
        </button>
      </div>

      {visHandlekurv && varer.length > 0 && (
        <div className="space-y-3 mb-4">
          {varer.map((v) => (
            <div
              key={v.kode}
              className="p-4 border rounded-xl shadow bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
            >
              <div>
                <p className="font-semibold text-base">{v.beskrivelse}</p>
                <p className="text-sm text-gray-500">Varenr: {v.varenummer}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => oppdaterHandlekurv(
                    varer.map((x) =>
                      x.kode === v.kode
                        ? { ...v, antall: Math.max(1, v.antall - 1), totalEksMva: v.pris * (v.antall - 1), totalInkMva: v.pris * (v.antall - 1) * MVA_SATS }
                        : x
                    )
                  )}
                  className="px-2 py-1 border rounded"
                >−</button>
                <input
                  type="number"
                  min="1"
                  value={v.antall}
                  onChange={(e) => {
                    const nyttAntall = Math.max(1, parseInt(e.target.value));
                    oppdaterHandlekurv(
                      varer.map((x) =>
                        x.kode === v.kode
                          ? { ...v, antall: nyttAntall, totalEksMva: v.pris * nyttAntall, totalInkMva: v.pris * nyttAntall * MVA_SATS }
                          : x
                      )
                    );
                  }}
                  className="w-16 text-center border rounded"
                />
                <button
                  onClick={() => oppdaterHandlekurv(
                    varer.map((x) =>
                      x.kode === v.kode
                        ? { ...v, antall: v.antall + 1, totalEksMva: v.pris * (v.antall + 1), totalInkMva: v.pris * (v.antall + 1) * MVA_SATS }
                        : x
                    )
                  )}
                  className="px-2 py-1 border rounded"
                >+</button>
                <button onClick={() => fjernVare(v.kode)} className="text-red-600 ml-2">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
          onClick={lastNedPDF}
        >
          Last ned PDF
        </button>
      </div>

      {visJobbModal && <JobblisteModal onSelectJob={handleSelectJob} onClose={() => setVisJobbModal(false)} />}
      {visManuellModal && redigeringsVare && (
        <ManuellKorrigeringModal
          vare={redigeringsVare}
          onClose={() => { setVisManuellModal(false); setRedigeringsVare(null); }}
          onSave={async (v) => { const nyListe = varer.map((x) => (x.kode === v.kode ? v : x)); await oppdaterHandlekurv(nyListe); }}
        />
      )}
    </div>
  );
}
