import NextAuth from "next-auth"
import GOVUKOneLoginProvider from "@/GOVUKOneLoginProvider"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GOVUKOneLoginProvider({
    clientId: process.env.AUTH_GOV_ID as string,
    clientPrivateKey: process.env.AUTH_GOV_PRIVATE_CERT as string,
    issuer: process.env.AUTH_GOV_ISSUER as string,
  }),],
})