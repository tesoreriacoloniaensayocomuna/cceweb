import { component$ } from '@builder.io/qwik';
import { useSiteConfig } from '../../routes/layout';

export const Hero = component$(() => {
  const siteConfig = useSiteConfig();
  const heroData = siteConfig.value.heroConfig;

  return (
    <section class="relative w-full h-[600px] flex items-center overflow-hidden">
      <div class="absolute inset-0 z-0 bg-black">
        <img class="w-full h-full object-cover opacity-80" alt="Hero Background" src={heroData.imageUrl}/>
        <div class="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-margin w-full">
        <div class="max-w-2xl text-on-primary">
          <h2 class="text-h1 mb-lg leading-tight" dangerouslySetInnerHTML={heroData.title}></h2>
          <p class="text-body-lg mb-xl text-primary-fixed">{heroData.subtitle}</p>
          <div class="flex flex-wrap gap-md">
            {heroData.buttons.filter(b => b.visible).map((btn, index) => (
              btn.style === 'outline' ? (
                <a key={index} href={btn.url} class="bg-transparent border-2 border-on-primary text-on-primary px-xl py-md rounded-lg text-label-md hover:bg-on-primary/10 transition-colors inline-block text-center">
                  {btn.label}
                </a>
              ) : (
                <a key={index} href={btn.url} class="bg-secondary-container text-on-secondary-container px-xl py-md rounded-lg text-label-md flex items-center gap-sm hover:opacity-90 transition-colors shadow-sm inline-flex justify-center">
                  {btn.label}
                  <span class="material-symbols-outlined">arrow_forward</span>
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
