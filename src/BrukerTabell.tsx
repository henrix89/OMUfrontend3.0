import React from "react";
import api from "./services/api"; // Juster banen om nødvendig

interface Props {
  firmaId: string;
  brukere: { brukernavn: string; rolle: string }[];
}

const BrukerTabell: React.FC<Props> = ({ firmaId, brukere }) => {
  const slettBruker = async (brukernavn: string) => {
    try {
      await api.delete("/user", {
        data: { firmaId, brukernavn },
      });
      window.location.reload(); // Evt. bytt ut med setState for mykere UX
    } catch (error) {
      console.error("❌ Feil ved sletting av bruker:", error);
    }
  };

  return (
    <table border={1} cellPadding={6} style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Brukernavn</th>
          <th>Rolle</th>
          <th>Handling</th>
        </tr>
      </thead>
      <tbody>
        {brukere.map((b) => (
          <tr key={b.brukernavn}>
            <td>{b.brukernavn}</td>
            <td>{b.rolle}</td>
            <td>
              <button onClick={() => slettBruker(b.brukernavn)}>🗑 Slett</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BrukerTabell;
