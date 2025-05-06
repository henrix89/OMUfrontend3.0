export interface LoginResponse {
    firmaId: string;
    brukernavn: string;
    rolle: string;
  }
  
  export async function login(
    firmaId: string,
    brukernavn: string,
    passord: string
  ): Promise<LoginResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ firmaId, brukernavn, passord })
    });
  
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Innlogging feilet');
    }
    return data;
  }