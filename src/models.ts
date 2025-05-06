// models.ts
export interface Vare {
    varenummer: string;
    beskrivelse: string;
    pris: number;
    strekkode?: string;
  }
  
  export interface VareMedAntall extends Vare {
    kode: string;          // Unik nøkkel for varen i handlekurven
    antall: number;
    tidspunkt: string;     // ISO-dato for når varen ble lagt til
    prisEksMva: number;
    totalEksMva: number;
    totalInkMva: number;
  }
  
  export interface Arbeidsordre {
    id: string;                // Unikt id eller ordrenummer
    navn: string;              // For eksempel "Montering av X" eller "Utlevering 2025-04-11"
    opprettetDato: string;      // ISO-dato når ordren ble opprettet
    opprettetAv: string;        // Navnet på brukeren (lokal admin) som opprettet ordren
    varer: VareMedAntall[];     // Liste over varer som er skannet inn under denne ordren
  }
  
  export interface UserData {
    brukernavn: string;
    passord: string;
    jobbvareuttak: string;
    role?: "firmauser" | "localadmin";
  }
  
  export interface Company {
    id: string;
    navn: string;
    jobbvareuttak: string;     // Dette kan fungere som en standard referanse/område for ordren – men nå suppleres av egne arbeidsordre
    users: UserData[];         // Liste over firmaets brukere
    arbeidsordre: Arbeidsordre[]; // Nytt felt – en liste over opprettede arbeidsordre for firmaet
  }
  