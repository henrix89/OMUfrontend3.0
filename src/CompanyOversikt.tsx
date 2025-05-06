import React, { useState } from "react";

// Eksporter brukerdata-type
export interface UserData {
  brukernavn: string;
  passord: string;
  jobbvareuttak: string;
  role?: string; // "firmauser" eller "localadmin"
}

// Firma-type
export interface Arbeidsordre {
  id: string;
  navn: string;
  varer: any[]; // Kan erstattes med en 'Vare'-type senere
}

export interface Company {
  id: string;
  navn: string;
  jobbvareuttak: string;
  users: UserData[];
  arbeidsordre: Arbeidsordre[];
}


interface CompanyOversiktProps {
  companies: Record<string, Company>;
  onShowJobb: (companyId: string) => void;
  onDeleteUser: (companyId: string, username: string) => void;
  onEditUser: (companyId: string, oldUsername: string, updatedUser: UserData) => void;
}

const CompanyOversikt: React.FC<CompanyOversiktProps> = ({
  companies,
  onShowJobb,
  onDeleteUser,
  onEditUser,
}) => {
  const [editingUser, setEditingUser] = useState<{
    companyId: string;
    oldUsername: string;
    newBrukernavn: string;
    newRole: string;
    newJobbvareuttak: string;
  } | null>(null);

  const startEditing = (companyId: string, user: UserData) => {
    setEditingUser({
      companyId,
      oldUsername: user.brukernavn,
      newBrukernavn: user.brukernavn,
      newRole: user.role || "firmauser",
      newJobbvareuttak: user.jobbvareuttak || "",
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
  };

  const saveEditing = () => {
    if (editingUser) {
      onEditUser(editingUser.companyId, editingUser.oldUsername, {
        brukernavn: editingUser.newBrukernavn,
        passord: "", // Ikke endret her – beholdes som det var
        jobbvareuttak: editingUser.newJobbvareuttak,
        role: editingUser.newRole,
      });
      setEditingUser(null);
    }
  };

  return (
    <div>
      <h3>Firmaoversikt</h3>
      {Object.values(companies).length === 0 ? (
        <p>Ingen firmaer opprettet enda.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {Object.values(companies).map((company) => (
            <div
              key={company.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                width: "300px",
              }}
            >
              <h4>{company.navn}</h4>
              <p>
                <strong>ID:</strong> {company.id}
              </p>
              <p>
                <strong>Standard Jobbvareuttak:</strong>{" "}
                {company.jobbvareuttak || "Ikke satt"}
              </p>
              <button onClick={() => onShowJobb(company.id)}>
                Vis JobbVareUttak
              </button>
              <div style={{ marginTop: "0.5rem" }}>
                <strong>Brukere:</strong>
                {company.users.length === 0 ? (
                  <p>Ingen brukere registrert.</p>
                ) : (
                  <ul style={{ padding: 0, listStyle: "none" }}>
                    {company.users.map((user, index) => (
                      <li
                        key={index}
                        style={{
                          marginBottom: "0.5rem",
                          borderBottom: "1px solid #eee",
                          paddingBottom: "0.5rem",
                        }}
                      >
                        {editingUser &&
                        editingUser.companyId === company.id &&
                        editingUser.oldUsername === user.brukernavn ? (
                          // Redigeringsmodus
                          <div>
                            <input
                              type="text"
                              value={editingUser.newBrukernavn}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  newBrukernavn: e.target.value,
                                })
                              }
                              placeholder="Brukernavn"
                            />
                            <select
                              value={editingUser.newRole}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  newRole: e.target.value,
                                })
                              }
                            >
                              <option value="firmauser">Firma Bruker</option>
                              <option value="localadmin">Lokal Admin</option>
                            </select>
                            <input
                              type="text"
                              value={editingUser.newJobbvareuttak}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  newJobbvareuttak: e.target.value,
                                })
                              }
                              placeholder="Jobbvareuttak"
                            />
                            <div style={{ marginTop: "0.5rem" }}>
                              <button onClick={saveEditing}>Lagre</button>{" "}
                              <button onClick={cancelEditing}>Avbryt</button>
                            </div>
                          </div>
                        ) : (
                          // Vis brukerdata
                          <div>
                            <p style={{ margin: 0 }}>
                              {user.brukernavn} –{" "}
                              {user.role === "localadmin"
                                ? "Lokal Admin"
                                : "Firma Bruker"}
                              <br />
                              Jobbvareuttak: {user.jobbvareuttak || "Ikke satt"}
                            </p>
                            <div style={{ marginTop: "0.25rem" }}>
                              <button
                                onClick={() => startEditing(company.id, user)}
                              >
                                Rediger
                              </button>{" "}
                              <button
                                onClick={() =>
                                  onDeleteUser(company.id, user.brukernavn)
                                }
                              >
                                Slett
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyOversikt;
