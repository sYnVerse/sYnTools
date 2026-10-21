<script setup lang="ts">
import { useHead } from '@vueuse/head';

const { t } = useI18n();
const title = t('about.page.document-title');

useHead({
  title,
  meta: [
    {
      name: 'description',
      content: t('about.page.meta-description'),
    },
  ],
});

const links = computed(() => [
  { href: 'https://tools.christran.io', label: t('about.page.link-tools') },
  { href: 'https://christran.io', label: t('about.page.link-site') },
  { href: 'https://christran.io/about', label: t('about.page.link-about-chris') },
  { href: 'https://christran.io/portfolio', label: t('about.page.link-portfolio') },
  { href: 'https://christran.io/blog', label: t('about.page.link-blog') },
  { href: 'https://github.com/sYnVerse', label: t('about.page.link-github') },
  { href: 'https://linkedin.com/in/synchris', label: t('about.page.link-linkedin') },
  { href: 'https://christran.io/privacy', label: t('about.page.link-privacy') },
  { href: 'https://christran.io/terms', label: t('about.page.link-terms') },
]);
</script>

<template>
  <div class="about-page">
    <header class="about-hero">
      <p class="about-eyebrow">{{ t('about.page.eyebrow') }}</p>
      <h1 class="about-title">{{ t('about.page.title') }}</h1>
      <p class="about-tagline">{{ t('about.page.tagline') }}</p>
    </header>

    <section class="about-section" aria-labelledby="about-intro-heading">
      <h2 id="about-intro-heading">{{ t('about.page.intro-heading') }}</h2>
      <p>{{ t('about.page.intro') }}</p>
    </section>

    <section class="about-section" aria-labelledby="about-credits-heading">
      <h2 id="about-credits-heading">{{ t('about.page.credits-heading') }}</h2>
      <p>
        {{ t('about.page.credits-lead') }}
        <c-link href="https://github.com/CorentinTh/it-tools" target="_blank" rel="noopener noreferrer">
          CorentinTh/it-tools
        </c-link>
        {{ t('about.page.credits-via') }}
        <c-link href="https://github.com/sharevb/it-tools" target="_blank" rel="noopener noreferrer">
          sharevb/it-tools
        </c-link>.
        {{ t('about.page.credits-corentin') }}
        <c-link href="https://corentin.tech?utm_source=it-tools&utm_medium=about" target="_blank" rel="noopener noreferrer">
          Corentin Thomasset
        </c-link>;
        {{ t('about.page.credits-sharevb') }}
      </p>
    </section>

    <section class="about-section" aria-labelledby="about-license-heading">
      <h2 id="about-license-heading">{{ t('about.page.license-heading') }}</h2>
      <p>
        {{ t('about.page.license-body') }}
        <c-link
          href="https://github.com/sYnVerse/sYnTools/blob/sYn-local-config/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
        >
          AGPL-3.0-or-later
        </c-link>.
        {{ t('about.page.license-upstream') }}
        <c-link
          href="https://github.com/sYnVerse/sYnTools/blob/sYn-local-config/NOTICE"
          target="_blank"
          rel="noopener noreferrer"
        >
          NOTICE
        </c-link>.
      </p>
      <p>
        {{ t('about.page.source-label') }}
        <c-link href="https://github.com/sYnVerse/sYnTools" target="_blank" rel="noopener noreferrer">
          github.com/sYnVerse/sYnTools
        </c-link>
      </p>
    </section>

    <section class="about-section" aria-labelledby="about-privacy-heading">
      <h2 id="about-privacy-heading">{{ t('about.page.privacy-heading') }}</h2>
      <p>
        {{ t('about.page.privacy-body') }}
        <c-link href="https://christran.io/privacy" target="_blank" rel="noopener noreferrer">
          {{ t('about.page.link-privacy') }}
        </c-link>.
      </p>
    </section>

    <section class="about-section about-links" aria-labelledby="about-links-heading">
      <h2 id="about-links-heading">{{ t('about.page.links-heading') }}</h2>
      <ul>
        <li v-for="link in links" :key="link.href">
          <c-link :href="link.href" target="_blank" rel="noopener noreferrer">
            {{ link.label }}
          </c-link>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="less">
.about-page {
  --about-accent: #7b9eff;
  --about-accent-dark: #4b6edf;
  --about-ink: #0b1021;
  --about-muted: #5b647a;
  --about-panel: rgba(123, 158, 255, 0.06);
  --about-border: rgba(123, 158, 255, 0.18);

  max-width: 40rem;
  margin: 2.5rem auto 3.5rem;
  padding: 0 1.25rem 2rem;
  color: var(--about-ink);
  line-height: 1.65;
}

:global(html.dark) .about-page {
  --about-ink: #d2d7eb;
  --about-muted: #b0bad1;
  --about-panel: rgba(123, 158, 255, 0.08);
  --about-border: rgba(123, 158, 255, 0.22);
}

.about-hero {
  margin-bottom: 2rem;
  padding: 1.5rem 1.25rem;
  border: 1px solid var(--about-border);
  border-radius: 12px;
  background: var(--about-panel);
}

.about-eyebrow {
  margin: 0 0 0.5rem;
  color: var(--about-accent);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.about-title {
  margin: 0 0 0.5rem;
  color: var(--about-ink);
  font-size: clamp(1.75rem, 4vw, 2.4rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.about-tagline {
  margin: 0;
  color: var(--about-muted);
  font-size: 1.05rem;
}

.about-section {
  margin-bottom: 1.75rem;

  h2 {
    margin: 0 0 0.65rem;
    color: var(--about-ink);
    font-size: 1.15rem;
    font-weight: 700;
  }

  p {
    margin: 0 0 0.75rem;
    color: var(--about-muted);
  }

  :deep(a),
  :deep(.n-a) {
    color: var(--about-accent) !important;
  }

  :deep(a:hover),
  :deep(.n-a:hover) {
    color: var(--about-accent-dark) !important;
  }
}

.about-links ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.55rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.about-links li {
  margin: 0;
}

@media (max-width: 640px) {
  .about-page {
    margin-top: 1.25rem;
    padding-inline: 1rem;
  }

  .about-hero {
    padding: 1.15rem 1rem;
  }
}
</style>
