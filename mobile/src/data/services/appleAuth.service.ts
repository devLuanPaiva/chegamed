import * as AppleAuthentication from "expo-apple-authentication";

import { rawFetch } from "@/lib/apiFetch";
import { AuthTokens } from "@/data/models/auth.model";

export class AppleSignInCancelledError extends Error {
    constructor() {
        super("Login com Apple cancelado.");
        this.name = "AppleSignInCancelledError";
    }
}

async function requestAppleSignIn(): Promise<AppleAuthentication.AppleAuthenticationCredential> {
    try {
        return await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
        });
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ERR_REQUEST_CANCELED"
        ) {
            throw new AppleSignInCancelledError();
        }

        console.error("Apple Sign-In failed", error);
        throw new Error("Não foi possível entrar com a Apple. Tente novamente.");
    }
}

interface AppleIdentity {
    identityToken: string;
    fullName?: string;
}

function joinFullName(fullName: AppleAuthentication.AppleAuthenticationFullName | null): string | undefined {
    const parts = [fullName?.givenName, fullName?.familyName].filter(Boolean);

    return parts.length > 0 ? parts.join(" ") : undefined;
}

async function obtainAppleIdentity(): Promise<AppleIdentity> {
    const credential = await requestAppleSignIn();

    if (!credential.identityToken) {
        throw new Error("A Apple não retornou um token de identidade válido.");
    }

    return {
        identityToken: credential.identityToken,
        fullName: joinFullName(credential.fullName),
    };
}

export async function signInWithApple(): Promise<AuthTokens> {
    const identity = await obtainAppleIdentity();

    return rawFetch<AuthTokens>("/auth/apple", {
        method: "POST",
        body: JSON.stringify(identity),
    });
}
