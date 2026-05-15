import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "../database/db";
import { news } from "../database/schema";
import { desc, eq, and } from "drizzle-orm";

import { Header } from "../components/header/header";
import { Hero } from "../components/hero/hero";
import { NewsGrid } from "../components/news/news-grid";
import { Contact } from "../components/contact/contact";
import { Footer } from "../components/footer/footer";

export const useGetLatestNews = routeLoader$(async (event) => {
  const db = getDb(event.env);
  return await db.select()
    .from(news)
    .where(eq(news.status, 'published'))
    .orderBy(desc(news.publishedAt))
    .limit(6);
});

export default component$(() => {
  return (
    <>
      <Header />
      <main class="flex-grow pt-16">
        <Hero />
        <NewsGrid />
        <Contact />
      </main>
      <Footer />
    </>
  );
});

export const head: DocumentHead = {
  title: "Colonia Ensayo - Inicio",
  meta: [
    {
      name: "description",
      content: "Bienvenidos a Colonia Ensayo. Construyendo una comunidad transparente, moderna y conectada.",
    },
  ],
};
