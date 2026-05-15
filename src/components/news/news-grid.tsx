import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { useGetLatestNews } from '../../routes/index';

export const NewsGrid = component$(() => {
  const newsSignal = useGetLatestNews();
  const items = newsSignal.value;

  if (items.length === 0) return null;

  return (
    <section class="py-xxl bg-surface">
      <div class="max-w-7xl mx-auto px-margin">
        <div class="flex justify-between items-end mb-xl">
          <div>
            <span class="text-secondary font-label-md uppercase tracking-wider mb-xs block">Actualidad</span>
            <h3 class="text-h2 text-on-background">Últimas Noticias</h3>
          </div>
          <Link class="text-primary text-label-md flex items-center gap-xs hover:underline" href="/noticias/"> Ver todas las noticias <span class="material-symbols-outlined text-sm">open_in_new</span></Link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-lg">
          {items.map((item, index) => {
            const isFeature = index === 0 && items.length > 3;
            const dateStr = new Date(item.publishedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
            
            return (
              <Link 
                key={item.id} 
                href={`/noticias/${item.slug}`}
                class={`${isFeature ? 'md:col-span-2 md:row-span-2' : ''} bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden group hover:shadow-lg transition-all flex flex-col`}
              >
                <div class={`${isFeature ? 'h-64' : 'h-40'} overflow-hidden relative`}>
                  {item.imageUrl ? (
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} src={item.imageUrl}/>
                  ) : (
                    <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                        <span class="material-symbols-outlined text-4xl">image</span>
                    </div>
                  )}
                  <div class="absolute top-md left-md">
                    <span class="bg-secondary text-on-secondary px-md py-xs rounded-full text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>
                <div class="p-xl flex-grow">
                  <span class="text-on-surface-variant text-[11px] mb-sm block uppercase tracking-widest">{dateStr}</span>
                  <h4 class={`${isFeature ? 'text-h3' : 'text-body-lg font-bold'} mb-md group-hover:text-primary transition-colors leading-tight`}>{item.title}</h4>
                  <p class={`text-on-surface-variant mb-lg ${isFeature ? 'text-body-md' : 'text-sm line-clamp-2'}`}>{item.excerpt || item.content.substring(0, 100) + '...'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
});
