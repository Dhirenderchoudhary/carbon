// SPDX-License-Identifier: AGPL-3.0-only
// Carbon (github.com/crbnos/carbon). Modified or adapted versions of this file,
// including ports, remain AGPLv3; serving them over a network requires releasing their source.

import { describe, expect, it, vi } from "vitest";

vi.mock("@carbon/content/glossary", () => ({
  terms: {},
  glossaryEntries: () => []
}));

vi.mock("@lingui/core/macro", () => ({
  msg: (strings: TemplateStringsArray | string, ...values: unknown[]) =>
    Array.isArray(strings)
      ? strings.reduce(
          (acc, s, i) => acc + s + (i < values.length ? String(values[i]) : ""),
          ""
        )
      : strings
}));

import { resolveUserSelectIds } from "./users.service";

function query(result: { data: unknown; error: unknown }, filters: unknown[]) {
  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      filters.push(["eq", column, value]);
      return builder;
    },
    in: (column: string, value: unknown) => {
      filters.push(["in", column, value]);
      return builder;
    },
    then: (
      resolve: (value: { data: unknown; error: unknown }) => unknown,
      reject?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(resolve, reject)
  };
  return builder;
}

describe("resolveUserSelectIds", () => {
  it("loads profiles from this company's group members and returns each person once", async () => {
    const memberFilters: unknown[] = [];
    const client = {
      from(table: string) {
        if (table === "groupMembers") {
          return query(
            {
              error: null,
              data: [
                {
                  memberUserId: "ada",
                  user: {
                    id: "ada",
                    firstName: "Ada",
                    lastName: "Lovelace",
                    fullName: "Ada Lovelace",
                    email: "ada@example.com",
                    avatarUrl: null
                  }
                },
                {
                  memberUserId: "ada",
                  user: {
                    id: "ada",
                    firstName: "Ada",
                    lastName: "Lovelace",
                    fullName: "Ada Lovelace",
                    email: "ada@example.com",
                    avatarUrl: null
                  }
                }
              ]
            },
            memberFilters
          );
        }
        return query({ error: null, data: [] }, []);
      }
    };

    const { users } = await resolveUserSelectIds(client as never, "co", [
      "ada",
      "other"
    ]);

    expect(memberFilters).toEqual([
      ["eq", "companyId", "co"],
      ["in", "memberUserId", ["ada", "other"]]
    ]);
    expect(users.data).toEqual([
      {
        id: "ada",
        firstName: "Ada",
        lastName: "Lovelace",
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        avatarUrl: null
      }
    ]);
  });
});
