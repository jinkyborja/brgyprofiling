declare global {
  namespace App {
    interface Locals {
      user: {
        id: number;
        username: string;
        roles: string[];
        permissions: string[];
      } | null;
    }
  }
}

export {};
