import React from 'react';
import { SOCIAL_CONFIG } from '@/utils/socialConfig'; // Adjust import path if necessary
import './socials.css';

interface SocialInfo {
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  phone?: string | null;
  email?: string | null;
  [key: string]: string | undefined | null; // Allow string index signature
}

interface SocialsProps {
  socialInfo: SocialInfo;
}

const Socials: React.FC<SocialsProps> = ({ socialInfo }) => {
  const activeLinks = Object.entries(socialInfo)
    .filter(([, value]) => {
      const strValue = String(value || "").trim();
      return strValue !== "";
    })
    .map(([key, value]) => {
      const config = SOCIAL_CONFIG[key];
      const strValue = String(value || "").trim();

      let finalHref = strValue;

      if (config.urlPrefix && !strValue.startsWith("http") && !strValue.startsWith(config.urlPrefix)) {
        finalHref = `${config.urlPrefix}${strValue}`;
      }

      return {
        key,
        href: finalHref,
        ...config,
      };
    })
    .filter((link) => link.icon); // Filter out links if icon is not defined in config

  if (activeLinks.length === 0) {
    return null; // Don't render anything if no active links
  }

  return (
    <div className="social-container">
      {activeLinks.map((link) => (
        <a 
          key={link.key} 
          href={link.href} 
          className={`social-link ${link.key}`} 
          aria-label={link.label} 
          target={link.key === "phone" || link.key === "email" ? "_self" : "_blank"} 
          title={link.label} 
          rel="noopener noreferrer"
        >
          {/* Using dangerouslySetInnerHTML to render SVG string */}
          <svg viewBox="0 0 24 24" width="20" height="20" className="icon-svg" dangerouslySetInnerHTML={{ __html: link.icon }} />
        </a>
      ))}
    </div>
  );
};

export default Socials;
