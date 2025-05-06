// FirmaTabell.tsx
import React, { useState } from "react";
import BrukerTabell from "./BrukerTabell";
import ArbeidsordreTabell from "./ArbeidsordreTabell";

export interface Firma {
  id: string;
  navn: string;
  brukere: any[];
  arbeidsordre: any[];
}

interface Props {
  firmaer: Firma[];
  onSlettFirma: (firmaId: string) => void;
}

const FirmaTabell: React.FC<Props> = ({ firmaer, onSlettFirma }) => {
  const [utvidet, setUtvidet] = useState<string | null>(null);

  return (
    <table border={1} cellPadding={8} style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Firma ID</th>
          <th>Navn</th>
          <th>Brukere</th>
          <th>Arbeidsordre</th>
          <th>Handling</th>
        </tr>
      </thead>
      <tbody>
        {firmaer.map((firma) => (
          <React.Fragment key={firma.id}>
            <tr>
              <td>{firma.id}</td>
              <td>{firma.navn}</td>
              <td>{firma.brukere.length}</td>
              <td>{firma.arbeidsordre.length}</td>
              <td>
                <button onClick={() => setUtvidet(utvidet === firma.id ? null : firma.id)}>
                  {utvidet === firma.id ? "Skjul" : "Se"}
                </button>
                <button onClick={() => onSlettFirma(firma.id)}>🗑 Slett</button>
              </td>
            </tr>
            {utvidet === firma.id && (
              <tr>
                <td colSpan={5}>
                  <h4>Brukere</h4>
                  <BrukerTabell firmaId={firma.id} brukere={firma.brukere} />
                  <h4>Arbeidsordre</h4>
                  <ArbeidsordreTabell firmaId={firma.id} arbeidsordre={firma.arbeidsordre} />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default FirmaTabell;
