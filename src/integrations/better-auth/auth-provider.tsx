import type { User } from "better-auth";
import { createContext, type ReactNode, useContext } from "react";
import type { Session } from "@/lib/auth-client";

type AuthContextType = {
	user: User;
	activeOrganizationId: string | null;
	activeOrganizationRole: string | null;
	activeOrganizationRoles: string[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
	children,
	session,
}: {
	children: ReactNode;
	session: Session;
}) {
	const activeOrganizationId = session.session.activeOrganizationId ?? null;
	const augmentedSession = session.session as Session["session"] & {
		activeOrganizationRole?: string | null;
		activeOrganizationRoles?: string[];
	};

	const activeOrganizationRole =
		augmentedSession.activeOrganizationRole ?? null;
	const activeOrganizationRoles =
		augmentedSession.activeOrganizationRoles ??
		(activeOrganizationRole ? [activeOrganizationRole] : []);

	return (
		<AuthContext.Provider
			value={{
				user: session.user,
				activeOrganizationId,
				activeOrganizationRole,
				activeOrganizationRoles,
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
