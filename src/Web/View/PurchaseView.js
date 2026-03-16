export default class PurchaseView {
  constructor() {
    this.$purchaseSection = document.querySelector("#purchase-section");
    this.$purchaseForm = document.querySelector("#purchase-form");
    this.$purchaseAmount = document.querySelector("#purchase-amount");
    this.$purchaseError = document.querySelector("#purchase-error");
  }

  bindPurchase(handler) {
    this.$purchaseForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const amount = Number(this.$purchaseAmount.value);
      handler(amount);
    });
  }

  showError(message) {
    this.$purchaseError.textContent = message;
    this.$purchaseAmount.focus();
  }

  clearError() {
    this.$purchaseError.textContent = "";
  }

  clearInput() {
    this.$purchaseAmount.value = "";
  }
}
