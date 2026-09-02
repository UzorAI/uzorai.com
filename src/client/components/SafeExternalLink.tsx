import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { isSafeExternalUrl, SAFE_EXTERNAL_REL } from '../../shared/urlSafety'

interface SafeExternalLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'rel' | 'target'> {
  href: string
  children: ReactNode
}

// Every externally-navigating anchor in the app renders through this
// component (EPIC #82 child: Worker/Browser Boundary Hardening): the
// destination is validated at render time (https-only, no credentials, no
// control characters, no protocol-relative smuggling) and always carries
// target="_blank" rel="noopener noreferrer". An unsafe href renders nothing
// rather than a broken/dangerous link, so a future edit that introduces a
// bad URL fails loudly in the UI instead of shipping quietly.
export default function SafeExternalLink({
  href,
  children,
  ...rest
}: SafeExternalLinkProps) {
  if (!isSafeExternalUrl(href)) return null
  return (
    <a href={href} target="_blank" rel={SAFE_EXTERNAL_REL} {...rest}>
      {children}
    </a>
  )
}
