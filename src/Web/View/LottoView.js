const html = String.raw;
export default class LottoView {
  constructor() {
    this.$purchaseForm = document.querySelector("#purchase-form");
    this.$purchaseAmount = document.querySelector("#purchase-amount");

    this.$lottoSection = document.querySelector("#lotto-section");
    this.$purchaseSummary = document.querySelector("#purchase-summary");
    this.$ticketContainer = document.querySelector("#ticket-container");

    this.$winningForm = document.querySelector("#winning-form");
    this.$resultModal = document.querySelector("#result-modal");
  }

  bindPurchase(handler) {
    this.$purchaseForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const amount = Number(this.$purchaseAmount.value);
      handler(amount);
    });
  }

  showError(message) {
    alert(message);
    this.$purchaseAmount.value = "";
  }

  renderLottos(lottos) {
    this.$purchaseSummary.textContent = `총 ${lottos.length}개를 구매했습니다.`;

    const ticketsHtml = lottos
      .map((lotto) => html`<div>🎟️ ${lotto.getNumbers().join(", ")}</div>`)
      .join("");

    this.$ticketContainer.innerHTML = ticketsHtml;

    this.$lottoSection.hidden = false;
  }
}
