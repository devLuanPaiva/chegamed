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

async function obtainAppleIdentityToken(): Promise<string> {
    const credential = await requestAppleSignIn();

    if (!credential.identityToken) {
        throw new Error("A Apple não retornou um token de identidade válido.");
    }

    return credential.identityToken;
}

export async function signInWithApple(): Promise<AuthTokens> {
    const identityToken = await obtainAppleIdentityToken();

    return rawFetch<AuthTokens>("/auth/apple", {
        method: "POST",
        body: JSON.stringify({ identityToken }),
    });
}
