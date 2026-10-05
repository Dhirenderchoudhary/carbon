// SPDX-License-Identifier: AGPL-3.0-only
// Carbon (github.com/crbnos/carbon). Modified or adapted versions of this file,
// including ports, remain AGPLv3; serving them over a network requires releasing their source.

"use client";

import { forwardRef } from "react";
import type { LinkProps } from "react-router";
import { Link } from "react-router";

/**
 * The app's `Link`: the one place that decides whether links prefetch. Today
 * they do not.
 *
 * Page data is served `max-age=0`, so the browser cannot answer a click from a
 * prefetched response. It also holds a second request for a URL until the
 * first one's response arrives, so a prefetch started on hover or on press
 * made the click's own request wait behind it: about 260 ms slower per click
 * than no prefetch, measured in production.
 *
 * Use this instead of `<Link prefetch="intent">`.
 */
export const PrefetchLink = forwardRef<
  HTMLAnchorElement,
  Omit<LinkProps, "prefetch">
>((props, ref) => <Link ref={ref} {...props} />);
PrefetchLink.displayName = "PrefetchLink";
