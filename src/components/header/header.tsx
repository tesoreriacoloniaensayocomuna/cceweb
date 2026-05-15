import { component$, useSignal, $ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { useSiteConfig } from '../../routes/layout';

export const Header = component$(() => {
  const loc = useLocation();
  const siteConfig = useSiteConfig();
  const isMenuOpen = useSignal(false);

  const toggleMenu = $(() => {
    isMenuOpen.value = !isMenuOpen.value;
  });

  const closeMenu = $(() => {
    isMenuOpen.value = false;
  });

  const getLinkClass = (path: string, isMobile = false) => {
    const isActive = loc.url.pathname === path || (path !== '/' && loc.url.pathname.startsWith(path));
    
    if (isMobile) {
      return `block w-full px-6 py-4 text-lg font-bold transition-all ${
        isActive ? 'text-primary bg-primary/10 border-l-4 border-primary' : 'text-gray-700 hover:bg-gray-50'
      }`;
    }

    if (isActive) {
      return "text-primary font-bold border-b-2 border-primary pb-1 hover:text-primary-container transition-all duration-200";
    }
    return "text-on-surface-variant font-medium hover:text-primary transition-all duration-200";
  };

  return (
    <>
      <header class="bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant shadow-sm fixed top-0 w-full z-50 font-['Public_Sans'] antialiased">
      <div class="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-8">
        <Link href="/" class="flex items-center gap-3 shrink-0" onClick$={closeMenu}>
          {siteConfig.value.logoUrl ? (
            <img src={siteConfig.value.logoUrl} alt="Colonia Ensayo Logo" class="h-12 object-contain" width="48" height="48" />
          ) : (
            <span class="material-symbols-outlined text-primary text-4xl">account_balance</span>
          )}
          <h1 class="text-xl lg:text-2xl font-black tracking-tighter text-primary whitespace-nowrap">Colonia Ensayo</h1>
        </Link>

        {/* Desktop Nav */}
        <nav class="hidden md:flex items-center justify-center gap-x-6 lg:gap-x-8 flex-1">
          <Link class={getLinkClass('/')} href="/">Inicio</Link>
          {siteConfig.value.navbarLinks.map((link) => (
            link.visible !== false ? (
              <Link key={link.path} class={getLinkClass(link.path)} href={link.path}>
                <span class="whitespace-nowrap">{link.label}</span>
              </Link>
            ) : null
          ))}
        </nav>

        <div class="flex items-center gap-4 shrink-0">
          {siteConfig.value.showPortalButton !== false && (
            <Link 
              href={siteConfig.value.portalButtonUrl}
              target="_blank"
              class="hidden lg:flex bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
            >
              Portal Ciudadano
            </Link>
          )}

          {/* Hamburger Button */}
          <button 
            onClick$={toggleMenu}
            class="md:hidden p-2 text-primary focus:outline-none"
            aria-label="Menu"
          >
            <span class="material-symbols-outlined text-3xl">
              {isMenuOpen.value ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    <div 
      class={`fixed inset-0 top-[80px] bg-white z-[60] transition-transform duration-300 md:hidden ${
        isMenuOpen.value ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ height: 'calc(100vh - 80px)' }}
    >
      <nav class="flex flex-col h-full bg-white overflow-y-auto pt-4">
        {siteConfig.value.showPortalButton !== false && (
          <div class="px-6 py-4 border-b border-gray-100">
            <Link 
              href={siteConfig.value.portalButtonUrl}
              target="_blank"
              class="flex w-full bg-primary text-white px-6 py-4 rounded-2xl text-center font-black items-center justify-center gap-2 shadow-lg shadow-primary/20"
              onClick$={closeMenu}
            >
              <span class="material-symbols-outlined">exit_to_app</span>
              Portal Ciudadano
            </Link>
          </div>
        )}

        <Link class={getLinkClass('/', true)} href="/" onClick$={closeMenu}>Inicio</Link>
        {siteConfig.value.navbarLinks.map((link) => (
          link.visible !== false ? (
            <Link 
              key={link.path} 
              class={getLinkClass(link.path, true)} 
              href={link.path}
              onClick$={closeMenu}
            >
              {link.label}
            </Link>
          ) : null
        ))}
      </nav>
    </div>
</>
  );
});
