import { mount } from '@vue/test-utils'
import WordleBoard from '../WordleBoard.vue'
import { VICTORY_MESSAGE, DEFEAT_MESSAGE } from '../../settings'
import { beforeEach } from "vitest"

describe('WordleBoard', () => {
  let wordOfTheDay = "TESTS"
  let wrapper: ReturnType<typeof mount>;
  beforeEach(() => {
    wrapper = mount(WordleBoard, {props: {wordOfTheDay}})
  })
  test("a victory message appears when the user makes a guess that matches the word of the day", async() => {
    // Arrange
    // this got removed because of beforeEach - const wrapper = mount(WordleBoard, {props: {wordOfTheDay}})

    // Act
    const guessInput = wrapper.find("input[type=text]")
    await guessInput.setValue("TESTS")
    await guessInput.trigger("keydown.enter")

    // Assert
    expect(wrapper.text()).toContain(VICTORY_MESSAGE)
  })

  // placeholder test - adding "test.todo" so it won't run
  test("a defeat message appears if the user makes a guess that is incorrect", async() => {
    const guessInput = wrapper.find("input[type=text]")
    await guessInput.setValue("WRONG")
    await guessInput.trigger("keydown.enter")

    expect(wrapper.text()).toContain(DEFEAT_MESSAGE)
  })

  test("no end-of-game message appears if the user has not yet made a guess", async() => {
    expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
    expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
  })
})
