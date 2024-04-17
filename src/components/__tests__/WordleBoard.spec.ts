import { mount } from '@vue/test-utils'
import WordleBoard from '../WordleBoard.vue'
import { VICTORY_MESSAGE, DEFEAT_MESSAGE, WORD_SIZE, MAX_GUESSES_COUNT } from '../../settings'
import { beforeEach } from "vitest"
import { before } from 'node:test'

describe('WordleBoard', () => {
  let wordOfTheDay = "TESTS"
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(WordleBoard, {props: {wordOfTheDay}})
  })

  async function playerTypesGuess(guess: string) {
    await wrapper.find("input[type=text]").setValue(guess)
  }

  async function playerPressesEnter() {
    await wrapper.find("input[type=text]").trigger("keydown.enter")
  }

  async function playerTypesAndSubmitsGuess(guess: string){
    // const guessInput = wrapper.find("input[type=text]")
    // await guessInput.setValue(guess)
    // await guessInput.trigger("keydown.enter")
    await playerTypesGuess(guess)
    await playerPressesEnter()
  }

  describe("End of the game messages", () => {
    test("a victory message appears when the user makes a guess that matches the word of the day", async() => {
      // Arrange
      // this got removed because of beforeEach - const wrapper = mount(WordleBoard, {props: {wordOfTheDay}})
  
      // Act
      await playerTypesAndSubmitsGuess(wordOfTheDay)
  
      // Assert
      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })
  
    // placeholder test - adding "test.todo" so it won't run
    // describe.each([
    //   { numberOfGuesses: 0, shouldSeeDefeatMessage: false },
    //   { numberOfGuesses: 1, shouldSeeDefeatMessage: false },
    //   { numberOfGuesses: 2, shouldSeeDefeatMessage: false },
    //   { numberOfGuesses: 3, shouldSeeDefeatMessage: false },
    //   { numberOfGuesses: 4, shouldSeeDefeatMessage: false },
    //   { numberOfGuesses: 5, shouldSeeDefeatMessage: false },
    //   { numberOfGuesses: MAX_GUESSES_COUNT, shouldSeeDefeatMessage: true },
    describe.each(
      // creating a dynamic data set
      Array.from(
        {length: MAX_GUESSES_COUNT + 1},
        // _ means current value
        (_, numberOfGuesses) => ({
          numberOfGuesses,
          shouldSeeDefeatMessage: numberOfGuesses === MAX_GUESSES_COUNT
        })
      )
    )(`a defeat message should appear if the player makes incorrect guesses ${MAX_GUESSES_COUNT} times in a row`, ({numberOfGuesses, shouldSeeDefeatMessage}) => {
      test(`therefore for ${numberOfGuesses} guess(es), a defeat message should ${shouldSeeDefeatMessage? "" : "not"} appear`, async() => {
        for (let i=0; i<numberOfGuesses; i++) {
          await playerTypesAndSubmitsGuess("WRONG")
        }

        if (shouldSeeDefeatMessage) {
          expect(wrapper.text()).toContain(DEFEAT_MESSAGE)
        } else {
          expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
        }
      })
    })
    // test("a defeat message appears if the user makes a guess that is incorrect", async() => {
    //   await playerTypesAndSubmitsGuess("WRONG")
  
    //   expect(wrapper.text()).toContain(DEFEAT_MESSAGE)
    // })
  
    test("no end-of-game message appears if the user has not yet made a guess", async() => {
      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
      expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
    })
  })
  
  describe("Rules for defining the word of the day", () => {
    beforeEach(() => {
      console.warn = vi.fn()
    })
    test.each(
      [
        { wordOfTheDay: 'FLY', reason: "word of the day must have 5 characters" },
        { wordOfTheDay: "tests", reason: "word of the day must be all in uppercase" },
        { wordOfTheDay: "QWERT", reason: "word of the day must be a valid English word" },
      ]
    )("Since $reason: $wordOfTheDay is invalid, therefore a warning must be emitted", async({wordOfTheDay}) => {
      // const spy = vi.spyOn(console, "warn")
      // spy.mockImplementation(() => null);
      // console.warn = vi.fn()
  
      mount(WordleBoard, {props: {wordOfTheDay}})
  
      expect(console.warn).toHaveBeenCalled()
    })
  
    // test("if the word of the day is not all in uppercase, a warning is emitted", async() => {
    //   console.warn = vi.fn()
  
    //   mount(WordleBoard, {props: {wordOfTheDay: "tests"}})
  
    //   expect(console.warn).toHaveBeenCalled()
    // })
  
    // test("if the word of the day is not a real English word, a warning is emitted", async() => {
    //   console.warn = vi.fn()
  
    //   mount(WordleBoard, {props: {wordOfTheDay: "QWERT"}})
  
    //   expect(console.warn).toHaveBeenCalled()
    // })
  
    test(`no warning is emitted if the word of the day is a real uppercase English word with ${WORD_SIZE} characters`, async() => {
      // console.warn = vi.fn()
  
      mount(WordleBoard, {props: {wordOfTheDay: "TESTS"}})
  
      expect(console.warn).not.toHaveBeenCalled()
    })
  })

  describe("Player input", () => {
    test("remains in focus the entire time", async () => {
      document.body.innerHTML = `<div id="app"></div>`
      wrapper = mount(WordleBoard, {
          props: {wordOfTheDay},
          attachTo: "#app"
      })

      expect(wrapper.find("input[type=text]").attributes("autofocus")).not.toBeUndefined()

      await wrapper.find("input[type=text]").trigger("blur")
      expect(document.activeElement).toBe(wrapper.find("input[type=text]").element)
    })

    test("the input gets cleared after each submission", async() => {
      await playerTypesAndSubmitsGuess("WRONG")

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual("")
    })

    test(`player guesses are limited to ${WORD_SIZE} letters`, async() => {
      await playerTypesAndSubmitsGuess(wordOfTheDay + "EXTRA")

      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })

    test("player guesses can only be submitted if they are real words", async() => {
      await playerTypesAndSubmitsGuess("QWERT")

      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
      expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
    })
    test("player guesses are not case-sensitive", async() => {
      await playerTypesAndSubmitsGuess(wordOfTheDay.toLowerCase())

      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })
    test("player guesses can only contain letters", async() => {
      await playerTypesAndSubmitsGuess("H3!RT")

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual('HRT')
    })

    test("non-letter characters do not render on the screen while being typed", async() => {
      await playerTypesAndSubmitsGuess("12")
      await playerTypesAndSubmitsGuess("123")

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual("")
    })

    test("the player loses control after the max amount of guesses have been sent", async() => {
      const guesses = [
        "WRONG",
        "GUESS",
        "HELLO",
        "WORLD",
        "HAPPY",
        "CODER"
      ]

      for (const guess of guesses) {
        await playerTypesAndSubmitsGuess(guess)
      }

      expect(wrapper.find("input[type=text]").attributes("disabled")).not.toBeUndefined()
    })

    test("the player loses control after the correct guess has been given", async() => {
      await playerTypesAndSubmitsGuess(wordOfTheDay)

      expect(wrapper.find("input[type=text]").attributes("disabled")).not.toBeUndefined()
    })

  })
  
  test("all previous guesses done by the player are visible in the page", async() => {
    const guesses = [
      "WRONG",
      "GUESS",
      "HELLO",
      "WORLD",
      "HAPPY",
      "CODER"
    ]

    for (const guess of guesses) {
      await playerTypesAndSubmitsGuess(guess)
    }

    for (const guess of guesses) {
      expect(wrapper.text()).toContain(guess)
    }
  })

})
