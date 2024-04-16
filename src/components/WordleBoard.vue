<script setup lang="ts">
import { VICTORY_MESSAGE, DEFEAT_MESSAGE, WORD_SIZE } from '@/settings'
import englishWords from "@/englishWordsWith5Letters.json"
import { ref, computed } from "vue"

defineProps({
  wordOfTheDay: {
    type: String,
    validator: (wordGiven: string) => englishWords.includes(wordGiven)
  }
})

const guessInProgress = ref("")
const guessSubmitted = ref("")

// if you want to make a WRITABLE computed ref, instead of passing a single callback
// we pass an object that has 2 callbacks inside of it - a getter and a setter
const formattedGuessInProgress = computed({
  get() {
    return guessInProgress.value
  },
  set(rawValue: string) {
    guessInProgress.value = rawValue
      .slice(0, WORD_SIZE)
      .toUpperCase()
      .replace(/[^A-Z]+/gi, "")
      // the [] allow me to represent a single character of whatever set I want to define inside the brackets
      // the ^ meant "not", so it's saying "replace anything that's not A-Z with nothing"
      // the + means I'm looking for one or more occurrences of a character that matches this set
      // the g means global, and it makes the regex not return after the first match
      // the i means case-insensitive
  }
})

function onSubmit() {
  if(!englishWords.includes(guessInProgress.value)) {
    return;
  }
  guessSubmitted.value = guessInProgress.value
}

</script>

<template>
  <input
    v-model="formattedGuessInProgress"
    type='text'
    @keydown.enter="onSubmit"
  >
  <p
    v-if="guessSubmitted.length > 0"
    v-text="guessSubmitted === wordOfTheDay ? VICTORY_MESSAGE : DEFEAT_MESSAGE"
  />
</template>

