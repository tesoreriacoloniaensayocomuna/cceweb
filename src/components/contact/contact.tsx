import { component$ } from '@builder.io/qwik';
import { useSiteConfig } from '../../routes/layout';
import { sanitizeMapUrl } from '../../lib/utils';

export const Contact = component$(() => {
  const siteConfig = useSiteConfig();
  const contactData = siteConfig.value.contactConfig;

  const mapSrc = sanitizeMapUrl(contactData?.mapUrl, contactData?.address);

  return (
    <section class="py-xxl bg-surface-container-lowest">
      <div class="max-w-7xl mx-auto px-margin">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-xxl items-start">
          <div>
            <h3 class="text-h2 text-on-background mb-md">Estamos para ayudarte</h3>
            <p class="text-body-lg text-on-surface-variant mb-xl">Visitá nuestras oficinas o contactanos a través de nuestros canales oficiales. Tu participación es fundamental para seguir creciendo.</p>
            <div class="space-y-lg">
              <div class="flex items-start gap-md">
                <div class="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary shrink-0">
                  <span class="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h5 class="font-bold text-lg mb-xs">Dirección Institucional</h5>
                  <p class="text-on-surface-variant">{contactData.address}</p>
                </div>
              </div>
              <div class="flex items-start gap-md">
                <div class="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary shrink-0">
                  <span class="material-symbols-outlined">call</span>
                </div>
                <div>
                  <h5 class="font-bold text-lg mb-xs">Teléfonos y Correo</h5>
                  <p class="text-on-surface-variant">{contactData.phone}</p>
                  <p class="text-on-surface-variant">{contactData.email}</p>
                </div>
              </div>
              <div class="flex items-start gap-md">
                <div class="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary shrink-0">
                  <span class="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h5 class="font-bold text-lg mb-xs">Horarios de Atención</h5>
                  <p class="text-on-surface-variant">{contactData.schedule}</p>
                </div>
              </div>
              {siteConfig.value.footerConfig?.socialLinks?.filter(l => l.visible).length > 0 && (
                <div class="flex items-start gap-md">
                  <div class="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary shrink-0">
                    <span class="material-symbols-outlined">share</span>
                  </div>
                  <div>
                    <h5 class="font-bold text-lg mb-md">Redes Sociales</h5>
                    <div class="flex gap-md">
                      {siteConfig.value.footerConfig.socialLinks.filter(l => l.visible).map((link, index) => (
                        <a key={index} class="px-4 h-10 rounded-full border border-outline flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-container hover:border-secondary-container transition-all" href={link.url} target="_blank" rel="noopener">
                          {link.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div class="bg-surface-container rounded-2xl overflow-hidden shadow-inner border border-outline-variant h-full min-h-[400px] relative">
            <div class="absolute inset-0 bg-blue-100 flex items-center justify-center">
              {mapSrc ? (
                <iframe src={mapSrc} class="w-full h-full border-0" allowFullscreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              ) : (

                <>
                  <img class="w-full h-full object-cover opacity-50 grayscale" data-alt="Map location" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdcZ6emT_-KvjhB-2U7oJ8lyxDZiGOytSEiHdDraVtXty2rQiG7coj2Y5LUFe48qOz-vP0BZQ0zRQc3kS3XZ8ifs8VB8nsSYOdZDdnhwocmrILSNZgNmhD3eklpYZ6EistmgROPlw3H2JFv9x9kjRtyMzO1u2hdL0Nv1c13CuFq_z_DEP2Ket4B_whaBWwqYMpT94la1BzK6jotknFQAbklzRlrSvgSqqfxDs0EufdYgQ6DfT_EzA-IYZRS1GXGYpjEHO8zj-XsrM"/>
                  <div class="absolute inset-0 flex flex-col items-center justify-center p-xl text-center">
                    <span class="material-symbols-outlined text-primary text-6xl mb-md" style="font-variation-settings: 'FILL' 1;">location_on</span>
                    <h4 class="font-bold text-xl text-primary mb-xs">Encontranos en el mapa</h4>
                    <p class="text-on-surface-variant mb-lg max-w-xs">Ubicación exacta de la Comuna de Colonia Ensayo</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
