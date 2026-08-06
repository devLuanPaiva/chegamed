import { Linking, Platform } from "react-native";

import { onlyDigits } from "@/lib/cpf";

export const PRIVACY_POLICY_URL = "https://chegamed.com.br/politica-de-privacidade";

async function openUrl(url: string): Promise<boolean> {
    try {
        await Linking.openURL(url);
        return true;
    } catch {
        return false;
    }
}

export async function openMapForAddress(address: string): Promise<boolean> {
    const encodedAddress = encodeURIComponent(address);
    const url =
        Platform.OS === "ios"
            ? `http://maps.apple.com/?q=${encodedAddress}`
            : `geo:0,0?q=${encodedAddress}`;

    return openUrl(url);
}

export async function openPhoneCall(phoneNumber: string): Promise<boolean> {
    return openUrl(`tel:${onlyDigits(phoneNumber)}`);
}
