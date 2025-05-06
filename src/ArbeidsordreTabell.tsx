import React from "react";
import api from "./services/api"; // Juster banen hvis nødvendig

interface Props {
  firmaId: string;
  arbeidsordre: { ordreId: string; beskrivelse: string }[];
}

const ArbeidsordreTabell: React.FC<Props> = ({ firmaId, arbeidsordre }) => {
  const slettOrdre = async (ordreId: string) => {
    try {
      await api.delete("/arbeidsordre", {
        data: { firmaId, ordreId },
      });
      window.location.reload(); // Du kan evt. heller bruke state for å oppdatere
    } catch (error) {
      console.error("Feil ved sletting av ordre:", error);
    }
  };

  return (
    <table border={1} cellPadding={6} style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Ordre ID</th>
          <th>Beskrivelse</th>
          <th>Handling</th>
        </tr>
      </thead>
      <tbody>
        {arbeidsordre.map((a) => (
          <tr key={a.ordreId}>
            <td>{a.ordreId}</td>
            <td>{a.beskrivelse}</td>
            <td>
              <button onClick={() => slettOrdre(a.ordreId)}>🗑 Slett</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ArbeidsordreTabell;
