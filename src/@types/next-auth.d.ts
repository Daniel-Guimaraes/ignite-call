import NextAuth from "next-auth";

declare module 'next-auth' {
  interface User {
    id,
    name,
    email,
    username,
    avatar_url
  }

  interface Session {
    user: User
  }
}