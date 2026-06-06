<script setup lang="ts">
import { useHead } from '@vueuse/head';

const { t } = useI18n();
const title = t('about.text.about-it-tools');

useHead({ title });
</script>

<template>
  <c-markdown :markdown="$t('about.content-fork')" mx-auto mt-50px max-w-600px />
</template>
