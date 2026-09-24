import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigate, tokenFor } from "./router";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export default function Link({ href, onClick, children, ...rest }: Props) {
  return (
    <a
      {...rest}
      href={tokenFor(href)}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
