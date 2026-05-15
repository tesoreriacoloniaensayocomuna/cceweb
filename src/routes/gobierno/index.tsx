import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { getDb } from '../../database/db';
import { authorities } from '../../database/schema';
import { asc } from 'drizzle-orm';

export const useGetAuthorities = routeLoader$(async (event) => {
    const db = getDb(event.env);
    return await db.select().from(authorities).orderBy(asc(authorities.sortOrder));
});

export default component$(() => {
    const authoritiesData = useGetAuthorities();

    // Agrupamos por categoría
    const categories = Array.from(new Set(authoritiesData.value.map(a => a.category)));

    return (
        <>
            <Header />
            <main class="flex-grow pt-24 pb-20 px-margin max-w-7xl mx-auto w-full min-h-[60vh]">
                <div class="mb-12">
                    <h1 class="text-h1 text-primary mb-4">Gobierno Comunal</h1>
                    <p class="text-body-lg text-on-surface-variant max-w-2xl">
                        Conocé a los funcionarios y representantes que trabajan día a día por el crecimiento y bienestar de Colonia Ensayo.
                    </p>
                </div>

                {authoritiesData.value.length === 0 ? (
                    <div class="bg-surface-container-lowest p-12 rounded-3xl border border-outline-variant text-center">
                        <span class="material-symbols-outlined text-6xl text-outline mb-4">groups</span>
                        <h3 class="text-h3 text-on-surface mb-2">Información no disponible</h3>
                        <p class="text-on-surface-variant">Próximamente se publicará la nómina completa de autoridades.</p>
                    </div>
                ) : (
                    <div class="flex flex-col gap-20">
                        {categories.map((category: any) => {
                            const categoryAuths = authoritiesData.value.filter(a => a.category === category);
                            const sortOrders = Array.from(new Set(categoryAuths.map(a => a.sortOrder))).sort((a: any, b: any) => a - b);
                            
                            return (
                                <section key={category}>
                                    <h2 class="text-h3 text-primary uppercase tracking-widest font-black mb-10 border-b-2 border-primary/10 pb-4 inline-block">
                                        {category as any}
                                    </h2>
                                    
                                    <div class="flex flex-col gap-12">
                                        {sortOrders.map((order: any, idx: number) => (
                                            <div key={order} class="flex flex-col gap-12">
                                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {categoryAuths.filter(a => a.sortOrder === order).map(auth => (
                                                        <div key={auth.id} class="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-all flex items-center gap-6 group">
                                                            {auth.photoUrl ? (
                                                                <img 
                                                                    src={auth.photoUrl} 
                                                                    alt={auth.name} 
                                                                    class="w-20 h-20 rounded-2xl object-cover border-2 border-primary/10 group-hover:border-primary/30 transition-all shadow-sm"
                                                                />
                                                            ) : (
                                                                <div class="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center border-2 border-primary/10 group-hover:border-primary/30 transition-all">
                                                                    <span class="material-symbols-outlined text-primary/20 text-4xl">person</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 class="text-xl font-black text-on-surface leading-tight mb-1">{auth.name}</h4>
                                                                <p class="text-primary font-bold text-sm uppercase tracking-wide">{auth.role}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {idx < sortOrders.length - 1 && (
                                                    <div class="flex items-center gap-4 px-10">
                                                        <div class="h-px bg-outline-variant flex-1 opacity-50"></div>
                                                        <div class="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                                                        <div class="h-px bg-outline-variant flex-1 opacity-50"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
});

export const head: DocumentHead = { title: "Gobierno - Colonia Ensayo" };
