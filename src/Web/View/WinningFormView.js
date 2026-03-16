export default class WinningFormView {
  constructor() {
    this.$lottoSection = document.querySelector("#lotto-section");
    this.$form = document.querySelector("#winning-form");
    this.$winningInputs = Array.from(
      this.$form.querySelectorAll(".winningNumber-line")
    );
    this.$bonusInput = this.$form.querySelector(".bonusNumber-line");
    this.$error = document.querySelector("#winning-error");
  }

  bindCheckResult(handler) {
    this.$form.addEventListener("submit", (event) => {
      event.preventDefault();

      const winningNumbers = this.$winningInputs.map((input) =>
        Number(input.value)
      );
      const bonusNumber = Number(this.$bonusInput.value);

      handler({ winningNumbers, bonusNumber });
    });
  }

  showError(message) {
    this.$error.textContent = message;
  }

  clearError() {
    this.$error.textContent = "";
  }

  clearInputs() {
    this.$winningInputs.forEach((input) => {
      input.value = "";
    });
    this.$bonusInput.value = "";
  }

  show() {
    this.$lottoSection.hidden = false;
  }

  hide() {
    this.$lottoSection.hidden = true;
  }
}
