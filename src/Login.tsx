import React, { useState } from "react";
import api from "./services/api";
import logo from "./assets/logo.png";
import OMU from "./assets/OMU.png";

interface Props {
  onLogin: (data: { brukernavn: string; rolle: string; firmaId: string }) => void;
}

export default function Login({ onLogin }: Props) {
  const [firmaId, setFirmaId] = useState("");
  const [brukernavn, setBrukernavn] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firmaId || !brukernavn || !passord) {
      setFeil("❌ Du må fylle ut alle felt.");
      return;
    }

    const loginData = {
      firmaId: firmaId.trim().toLowerCase(),
      brukernavn: brukernavn.trim(),
      passord: passord,
    };

    console.log("📤 Sender login:", loginData); // 🔍 Viktig logging

    try {
      const response = await api.post("/auth/login", loginData);
      const data = response.data;

      // ✅ Lagre brukerdata lokalt
      localStorage.setItem("firmaId", data.firmaId);
      localStorage.setItem("firmaRef", data.firmaRef);
      localStorage.setItem("rolle", data.rolle);
      localStorage.setItem("brukernavn", data.brukernavn);

      onLogin({
        brukernavn: data.brukernavn,
        rolle: data.rolle,
        firmaId: data.firmaId,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Innlogging feilet. Prøv igjen.";
      setFeil(`❌ ${msg}`);
      console.error("🔴 Login-feil:", err);
    }
  };

  return (
    <div className="theme-card" style={{ maxWidth: "400px", margin: "auto", padding: "2rem", position: "relative" }}>
      {/* Logo oppe til venstre */}
      <img
        src={logo}
        alt="Firma Logo"
        style={{ position: "absolute", top: "20px", left: "20px", width: "80px", height: "auto" }}
      />

      {/* OMU-logo midtstilt */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <img src={OMU} alt="OMU Logo" style={{ width: "120px", height: "auto" }} />
      </div>

      {/* Skjema */}
      <form onSubmit={handleLogin}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>🔐 Logg inn</h2>

        <div className="input-group" style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="🏢 Firma-ID"
            value={firmaId}
            onChange={(e) => setFirmaId(e.target.value)}
            required
          />
        </div>

        <div className="input-group" style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="👤 Brukernavn"
            value={brukernavn}
            onChange={(e) => setBrukernavn(e.target.value)}
            required
          />
        </div>

        <div className="input-group" style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="🔒 Passord"
            value={passord}
            onChange={(e) => setPassord(e.target.value)}
            required
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button type="submit">➡️ Logg inn</button>
        </div>

        {feil && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {feil}
          </p>
        )}
      </form>
    </div>
  );
}
