<script lang="ts" setup>
import Home2 from '~icons/tabler/home-2';
import Menu2 from '~icons/tabler/menu-2';
import { NIcon, useThemeVars } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import MenuLayout from '../components/MenuLayout.vue';
import NavbarButtons from '../components/NavbarButtons.vue';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';
import { config } from '@/config';
import { useStyleStore } from '@/stores/style.store';
import { useToolStore } from '@/tools/tools.store';
import type { ToolCategory } from '@/tools/tools.types';

const themeVars = useThemeVars();
const styleStore = useStyleStore();
const version = config.app.version;
const commitSha = config.app.lastCommitSha.slice(0, 7);

// Expose the navbar height so the mobile menu (MenuLayout.vue) can position
// itself right under the always-visible top bar.
const navbarRef = ref<HTMLElement | null>(null);
const { height: navbarHeight } = useElementSize(navbarRef, undefined, { box: 'border-box' });
watchEffect(() => {
  document.documentElement.style.setProperty('--app-topbar-height', `${Math.round(navbarHeight.value)}px`);
});

const { t, locale } = useI18n();

const toolStore = useToolStore();
const { favoriteTools, toolsByCategory } = storeToRefs(toolStore);

const tools = computed<ToolCategory[]>(() => [
  ...(favoriteTools.value.length > 0
    ? [{ name: t('tools.categories.favorite-tools'), components: favoriteTools.value }]
    : []),
  ...toolsByCategory.value,
]);
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <RouterLink to="/" class="hero-wrapper">
        <div class="hero-bg" aria-hidden="true" />
        <div class="text-wrapper">
          <div class="brand-row">
            <img class="brand-mark" src="/syntools-mark.svg" width="36" height="36" alt="" />
            <div class="title">{{ $t('home.brand') }}</div>
          </div>
          <div class="divider" />
          <div class="subtitle">
            {{ $t('home.subtitle') }}
          </div>
        </div>
      </RouterLink>

      <div class="sider-content">
        <div v-if="styleStore.isSmallScreen" mb-24px flex justify-center>
          <NavbarButtons />
        </div>

        <CollapsibleToolMenu :tools-by-category="tools" />

        <div class="footer">
          <div>
            {{ $t('home.brand') }}

            <c-link target="_blank" rel="noopener" href="https://github.com/sYnVerse/sYnTools/tree/sYn-local-config">
              v{{ version }}
            </c-link>

            <template v-if="commitSha && commitSha.length > 0">
              -
              <c-link
                target="_blank"
                rel="noopener"
                type="primary"
                :href="`https://github.com/sYnVerse/sYnTools/tree/${commitSha}`"
              >
                {{ commitSha }}
              </c-link>
            </template>
          </div>
          <div>
            © {{ new Date().getFullYear() }}
            <c-link target="_blank" rel="noopener" href="https://corentin.tech?utm_source=it-tools&utm_medium=footer">
              Corentin Thomasset
            </c-link>
          </div>
          <div style="margin-top: 8px; font-size: 0.85em; opacity: 0.85;">
            <c-link target="_blank" rel="noopener noreferrer" href="https://christran.io">
              christran.io
            </c-link>
            &bull;
            <c-link target="_blank" rel="noopener noreferrer" href="https://christran.io/privacy">
              Privacy Policy
            </c-link>
            &bull;
            <c-link target="_blank" rel="noopener noreferrer" href="https://christran.io/terms">
              Terms of Service
            </c-link>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div ref="navbarRef" class="navbar" flex items-center justify-center gap-2>
        <c-button
          circle
          variant="text"
          :aria-label="$t('home.toggleMenu')"
          @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
        >
          <NIcon size="25" :component="Menu2" />
        </c-button>

        <c-tooltip :tooltip="$t('home.home')" position="bottom">
          <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
            <NIcon size="25" :component="Home2" />
          </c-button>
        </c-tooltip>

        <Suspense>
          <command-palette :key="locale" />
        </Suspense>

        <div>
          <NavbarButtons v-if="!styleStore.isSmallScreen" />
        </div>
      </div>
      <!-- Positioned wrapper so the route-change loading overlay (see router.ts)
           can cover just the page, leaving the nav bar and menu visible. -->
      <div class="page-content">
        <slot />
      </div>
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
.footer {
  text-align: center;
  color: #838587;
  margin-top: 20px;
  padding: 20px 0;
}

.sider-content {
  padding-top: 20px;
  padding-bottom: 50px;

  @media (max-width: 700px) {
    padding-top: 0;
  }
}

.page-content {
  position: relative;
}

.navbar {
  @media (max-width: 700px) {
    position: sticky;
    top: 0;
    z-index: 20;
    margin: -13px -13px 13px;
    padding: 13px;
    background-color: v-bind('themeVars.bodyColor');
  }
}

.hero-wrapper {
  --syn-hero-bg: #0b1021;
  --syn-hero-accent: #7b9eff;
  --syn-hero-text: #f4f7ff;

  position: sticky;
  display: flex;
  top: 0;
  left: 0;
  z-index: 10;
  height: 125px;
  overflow: hidden;
  width: inherit;
  text-decoration: none;

  .hero-bg {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(160deg, #0b1021 0%, #121a33 55%, #1a2748 100%);
  }

  .hero-bg::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 36%;
    background: linear-gradient(180deg, transparent, rgba(123, 158, 255, 0.16));
  }

  .text-wrapper {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    top: 18px;
    color: var(--syn-hero-text);
    padding: 0 12px;
  }

  .brand-row {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .brand-mark {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    display: block;
    flex: none;
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.2px;
    color: var(--syn-hero-accent);
  }

  .divider {
    width: 50px;
    height: 2px;
    border-radius: 4px;
    background-color: var(--syn-hero-accent);
    margin: 8px auto 6px;
  }

  .subtitle {
    font-size: 13px;
    line-height: 1.35;
    opacity: 0.92;
    color: var(--syn-hero-text);
  }

  // Light theme: softer navy panel so the accent still reads as brand-first.
  :root:not(.dark) & {
    --syn-hero-bg: #e8eefc;
    --syn-hero-text: #0b1021;

    .hero-bg {
      background: linear-gradient(160deg, #e8eefc 0%, #d7e2fb 55%, #c5d4f7 100%);
    }

    .hero-bg::after {
      background: linear-gradient(180deg, transparent, rgba(123, 158, 255, 0.22));
    }
  }

  @media (max-width: 700px) {
    position: static;
    height: auto;
    padding: 24px 0;

    .hero-bg {
      display: none;
    }

    .text-wrapper {
      position: static;
      padding-top: 0;
      color: v-bind('themeVars.textColor1');
    }

    .title {
      color: #7b9eff;
    }

    .subtitle {
      color: v-bind('themeVars.textColor2');
    }
  }
}
</style>
