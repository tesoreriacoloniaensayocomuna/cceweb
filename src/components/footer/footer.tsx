import { component$ } from '@builder.io/qwik';
import { useSiteConfig } from '../../routes/layout';

export const Footer = component$(() => {
  const siteConfig = useSiteConfig();
  const footerData = siteConfig.value.footerConfig;

  return (
    <footer class="bg-surface-container-low border-t border-outline-variant w-full py-xl mt-auto text-sm font-['Public_Sans']">
      <div class="max-w-7xl mx-auto px-margin grid grid-cols-1 md:grid-cols-2 gap-xl">
        <div class="space-y-md">
          <div class="flex items-center gap-sm">
            <span class="material-symbols-outlined text-primary">account_balance</span>
            <span class="font-bold text-primary text-lg">Colonia Ensayo</span>
          </div>
          <p class="text-on-surface-variant max-w-sm">{footerData.description}</p>
        </div>
        <div class="grid grid-cols-2 gap-xl md:justify-items-end">
          <div class="space-y-md">
            <h5 class="font-bold text-primary uppercase tracking-widest text-xs">Menú Rápido</h5>
            <ul class="space-y-sm">
              {footerData.quickLinks.filter(l => l.visible).map((link, index) => (
                <li key={index}><a class="text-on-surface-variant cursor-pointer hover:text-primary transition-colors underline-offset-4" href={link.url}>{link.label}</a></li>
              ))}
            </ul>
          </div>
          {footerData.socialLinks.filter(l => l.visible).length > 0 && (
            <div class="space-y-md">
              <h5 class="font-bold text-primary uppercase tracking-widest text-xs">Redes Sociales</h5>
              <ul class="space-y-sm">
                {footerData.socialLinks.filter(l => l.visible).map((link, index) => (
                  <li key={index}><a class="text-on-surface-variant cursor-pointer hover:text-primary transition-colors underline-offset-4" href={link.url} target="_blank" rel="noopener">{link.platform}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
});
