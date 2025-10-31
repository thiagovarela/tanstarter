import { createContext, useContext, ReactNode } from "react";
import { authClient, type Session } from "@/lib/auth-client";

type AuthContextType = {
	session: Session | null;
	isPending: boolean;
	refetch: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const { data: session, isPending, refetch } = authClient.useSession();

	return (
		<AuthContext.Provider value={{ session, isPending, refetch }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
