import { useEffect, useState } from "react";

interface EmailObfuscatorProps {
  className?: string;
  textOnly?: boolean;
}

export function EmailObfuscator({ className = "", textOnly = false }: EmailObfuscatorProps) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Obfuscated assembly to prevent email scraping from HTML source
    const user = "eternitychocolateooty";
    const domain = "gmail.com";
    setEmail(`${user}@${domain}`);
  }, []);

  if (!email) {
    return <span className="animate-pulse bg-muted/20 h-4 w-48 inline-block rounded" />;
  }

  if (textOnly) {
    return <span className={className}>{email}</span>;
  }

  return (
    <a
      href={`mailto:${email}`}
      className={`hover:text-accent transition-colors underline ${className}`}
    >
      {email}
    </a>
  );
}
