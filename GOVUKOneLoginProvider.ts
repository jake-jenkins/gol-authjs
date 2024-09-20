import { OAuthConfig } from "next-auth/providers";
import { setCookie, getCookie } from "cookies-next";
import { v4 as uuidv4 } from 'uuid';

// issue, we cannot pass in request object to the provider

export interface GovUkSignInProfile extends Record<string, any> {
  sub: string;
  email: string;
  phone_number: string;
}

export interface GovUkSignInConfig {
  clientId: string
  clientPrivateKey: string
  issuer: string
}

const scope = "openid email phone";
const name = "GOV.UK One Login";

export default function GOVUKOneLoginProvider<P extends GovUkSignInProfile>(
  options: GovUkSignInConfig
): OAuthConfig<P> {
  return {
    id: "gol",
    name,
    issuer: options.issuer,
    type: "oauth",
    clientId: options.clientId,
    authorization: {
      params: {
        state: state(),
        nonce: nonce(),
        scope,
      },
    },
    // idToken: false,
    token: {
       async request({
         provider,
         params,
         client,
         checks,
       }: {provider: any, params: any, client: any, checks: any}): Promise<{ tokens: any }> {
         const redirectUri = provider.callbackUrl;
         const tokens = await client.callback(redirectUri, params, {
           ...checks,
           nonce: nonce(),
         });
         return { tokens };
       },
     },
    profile: (profile) => {
      return {
        id: profile.sub,
        email: profile.email,
        phone: profile.phone_number,
      };
    },
    client: {
      client_id: options.clientId,
      clientPrivateKey: options.clientPrivateKey,
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "PS256",
      id_token_signed_response_alg: "ES256"
    },
    // @ts-ignore
    jwks: { keys: [options.clientPrivateKey] },
  };
}

function readCookie(name: string) {
  return getCookie(name);
}

function writeCookie(name: string, value: string) {
  setCookie(name, value, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  })
}

function nonce() {
  const existingNocne = readCookie("nonce");
  if (!existingNocne) {
    const newNonce = uuidv4();
    writeCookie("nonce", newNonce);
    return newNonce;
  }
}

function state() {
  const existingState = readCookie("state");
  if (!existingState) {
    const newState = uuidv4();
    writeCookie("state", newState);
    return newState;
  }
}