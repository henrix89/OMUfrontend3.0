import React, { useState, useEffect } from "react";

interface Props {
  vare?: any;
  onClose: () => void;
  onSave: (vare: any) => void;
}

export default function ManuellKorrigeringModal({ vare, onClose, onSave }: Props) {
  const [varenummer, setVarenummer] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [antall, setAntall] = useState(1);
  const [pris, setPris] = useState(0);

  useEffect(() => {
    if (vare) {
      setVarenummer(vare.varenummer || vare.kode);
      setBeskrivelse(vare.beskrivelse);
      setAntall(vare.antall);
      setPris(vare.pris);
    }
  }, [vare]);

  const endreAntall = (diff: number) => {
    setAntall(prev => Math.max(1, prev + diff));
  };

  const handleSubmit = () => {
    if (!beskrivelse || antall <= 0 || pris < 0) return;

    const tidspunkt = new Date().toISOString();
    const prisEksMva = pris;
    const totalEksMva = prisEksMva * antall;
    const totalInkMva = totalEksMva * 1.25;

    const nyVare = {
      kode: varenummer || Math.random().toString(36).substring(2, 9),
      varenummer,
      beskrivelse,
      antall,
      pris,
      prisEksMva,
      totalEksMva,
      totalInkMva,
      tidspunkt
    };

    onSave(nyVare);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">{vare ? "Rediger vare" : "Ny vare"}</h2>

        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Varenummer:</label>
          <input
            value={varenummer}
            onChange={(e) => setVarenummer(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Beskrivelse:</label>
          <input
            value={beskrivelse}
            onChange={(e) => setBeskrivelse(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Antall:</label>
          <div className="flex items-center justify-center gap-3">
            <button
              className="bg-gray-200 px-3 py-1 rounded text-xl font-bold"
              onClick={() => endreAntall(-1)}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={antall}
              onChange={(e) => setAntall(Math.max(1, Number(e.target.value)))}
              className="w-16 text-center border rounded px-2 py-1"
            />
            <button
              className="bg-gray-200 px-3 py-1 rounded text-xl font-bold"
              onClick={() => endreAntall(1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Pris (eks. MVA):</label>
          <input
            type="number"
            value={pris}
            min={0}
            step={0.01}
            onChange={(e) => setPris(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Avbryt
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {vare ? "Lagre" : "Legg til"}
          </button>
        </div>
      </div>
    </div>
  );
}
