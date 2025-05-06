import { useUser } from "./context/UserContext";
import logo from "./assets/logo.png";
import OMUlogo from "./assets/OMU.png"; // ← ny import

export default function AppHeader() {
  const { bruker, setBruker } = useUser();

  const loggUt = () => {
    localStorage.removeItem("user");
    setBruker(null);
  };

  if (!bruker) return null;

  return (
    <header className="sticky top-0 z-40 bg-white shadow flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <img src={OMUlogo} alt="OMU logo" className="h-8 w-auto" />
        <img src={logo} alt="Firmalogo" className="h-8 w-auto" />
        <div>
          <p className="font-semibold text-gray-800">{bruker.brukernavn}</p>
          <p className="text-sm text-gray-500">{bruker.rolle} – {bruker.firmaId}</p>
        </div>
      </div>
      <button
        onClick={loggUt}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
      >
        Logg ut
      </button>
    </header>
  );
}
