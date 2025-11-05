import type { User } from "better-auth";
import { createContext, type ReactNode, useContext } from "react";
import type { Session } from "@/lib/auth-client";

type AuthContextType = {
	user: User;
	activeOrganizationId: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
	children,
	session,
}: {
	children: ReactNode;
	session: Session;
}) {
	return (
		<AuthContext.Provider
			value={{
				user: session.user,
				activeOrganizationId: session.session.activeOrganizationId ?? null,
			}}
		>
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
