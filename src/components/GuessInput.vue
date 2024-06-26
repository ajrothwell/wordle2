<script setup lang="ts">
import { WORD_SIZE } from '@/settings'
import englishWords from "@/englishWordsWith5Letters.json"
import { ref, computed, watchEffect } from "vue"
import GuessView from "@/components/GuessView.vue"

withDefaults(defineProps<{ disabled?: boolean }>(), {disabled: false})

const guessInProgress = ref<string|null>(null)
const hasFailedValidation = ref<boolean>(false)

const emit = defineEmits<{
  "guess-submitted": [guess: string]
}>();

// if you want to make a WRITABLE computed ref, instead of passing a single callback
// we pass an object that has 2 callbacks inside of it - a getter and a setter
const formattedGuessInProgress = computed<string>({
  get() {
    // ?? is the null coeleascing operator, which means "if the value on the left is null or undefined, use the value on the right"
    return guessInProgress.value ?? ""
  },
  set(rawValue: string) {
    // guessInProgress.value = null
    
    guessInProgress.value = rawValue
      // .slice(0, WORD_SIZE)
      // .toUpperCase()
      // .replace(/[^A-Z]+/gi, "")
      // the [] allow me to represent a single character of whatever set I want to define inside the brackets
      // the ^ meant "not", so it's saying "replace anything that's not A-Z with nothing"
      // the + means I'm looking for one or more occurrences of a character that matches this set
      // the g means global, and it makes the regex not return after the first match
      // the i means case-insensitive
    
    // console.log('rawValue:', rawValue, 'guessInProgress.value:', guessInProgress.value)
  }
})

watchEffect(() => {
formattedGuessInProgress.value =
formattedGuessInProgress.value
?.slice(0, WORD_SIZE)
.toUpperCase()
.replace(/[^A-ZЁА-Я]+/gi, "") ?? "";
});

function onSubmit() {
  if(!englishWords.includes(formattedGuessInProgress.value)) {
    hasFailedValidation.value = true
    setTimeout(() => hasFailedValidation.value = false, 500)
    return;
  }

  emit("guess-submitted", formattedGuessInProgress.value)
  // guessSubmitted.value = formattedGuessInProgress.value
  guessInProgress.value = null
}

</script>

<template>
  <!-- <ul class="word">
    <li v-for="(letter, index) in formattedGuessInProgress.padEnd(WORD_SIZE, ' ')"
        :key="`${letter}-${index}`"
        :data-letter="letter"
        class="letter"
        v-text="letter"/>
  </ul> -->

  <guess-view v-if="!disabled" :class="{shake: hasFailedValidation}":guess="formattedGuessInProgress" />

  <input v-model="formattedGuessInProgress"
         :maxlength="WORD_SIZE"
         :disabled="disabled"
         aria-label="Make your guess for the word of the day!"
         autofocus
         @blur="({target}) => (target as HTMLInputElement).focus()"
         type="text"
         @keydown.enter="onSubmit">
</template>

<style scoped>
input {
  position: absolute;
  opacity: 0;
}

.shake {
  animation: shake;
  animation-duration: 100ms;
  animation-iteration-count: 2;
}

@keyframes shake {
  0% {
    transform: translateX(-2%);
  }
  25% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(2%);
  }
  75% {
    transform: translateX(0);
  }
}

</style>

