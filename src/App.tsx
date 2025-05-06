import React, { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";
import AppHeader from "./AppHeader";
import CompanyDashboard from "./CompanyDashboard";
import LocalAdminDashboard from "./LocalAdminDashboard";
import RootAdminDashboard from "./RootAdminDashboard";
import api from "./services/api";
import omuLogo from "./assets/omu.png";
import logo from "./assets/logo.png";

// import { useViewMode } from "./ViewModeContext";

const App: React.FC = () => {
  const { bruker, setBruker } = useUser();
  // const { mobilvisning, toggleVisning } = useViewMode();
  const [firmaId, setFirmaId] = useState("");
  const [brukernavn, setBrukernavn] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState("");

  useEffect(() => {
    const lagret = localStorage.getItem("user");
    if (lagret) {
      const parsed = JSON.parse(lagret);
      if (parsed.firmaId && parsed.brukernavn && parsed.rolle) {
        setBruker(parsed);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeil("");

    if (!firmaId || !brukernavn || !passord) {
      setFeil("Vennligst fyll ut alle felt");
      return;
    }

    if (firmaId.toLowerCase() === "rootadmin") {
      if (brukernavn === "rootadmin" && passord === "Passord1234") {
        const brukerData = { firmaId: "rootadmin", brukernavn: "rootadmin", rolle: "rootadmin" };
        setBruker(brukerData);
        localStorage.setItem("user", JSON.stringify(brukerData));
      } else {
        setFeil("Ugyldig rootadmin-legitimasjon");
      }
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        firmaId: firmaId.trim().toLowerCase(),
        brukernavn: brukernavn.trim(),
        passord,
      });

      const result = response.data;
      const brukerData = {
        firmaId: result.firmaId,
        brukernavn: result.brukernavn,
        rolle: result.rolle,
      };

      setBruker(brukerData);
      localStorage.setItem("user", JSON.stringify(brukerData));
    } catch (err: any) {
      const msg = err.response?.data?.message || "Innlogging feilet. Prøv igjen.";
      setFeil(`❌ ${msg}`);
    }
  };

  if (!bruker) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="bg-white shadow-md rounded-lg w-full max-w-md p-6 space-y-4">
          <div className="flex justify-between items-center">
          <img src={logo} alt="logo" className="h-12" />
  <img src={omuLogo} alt="OMU logo" className="h-12" />
</div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="text"
              placeholder="Firma-ID"
              value={firmaId}
              onChange={(e) => setFirmaId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Brukernavn"
              value={brukernavn}
              onChange={(e) => setBrukernavn(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Passord"
              value={passord}
              onChange={(e) => setPassord(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Logg inn
            </button>
          </form>

          <p className="text-center text-sm text-blue-500 cursor-pointer hover:underline">
            Glemt passord?
          </p>

          {feil && <p className="text-red-600 text-sm text-center">{feil}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 p-0 m-0">
      {/*
      <div className="text-right p-2">
        <button
          onClick={toggleVisning}
          className="text-sm text-gray-700 border px-3 py-1 rounded hover:bg-gray-100"
        >
          Bytt til {mobilvisning ? "PC" : "mobil"}-visning
        </button>
      </div>
      */}
      <AppHeader />
      {bruker.rolle === "rootadmin" && <RootAdminDashboard />}
      {bruker.rolle === "localadmin" && <LocalAdminDashboard firmaId={bruker.firmaId} />}
      {bruker.rolle === "bruker" && <CompanyDashboard firmaId={bruker.firmaId} />}
    </div>
  );
};

export default App;
