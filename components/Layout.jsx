import React from "react";
import { AppShell, Navbar, Header } from "@mantine/core";

export function Layout({ children }) {
  return (
    <AppShell
      padding="md"
      navbar={<Navbar width={{ base: 300 }} height={500} padding="xs"></Navbar>}
      header={<Header height={60} padding="xs"></Header>}
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  );
}
