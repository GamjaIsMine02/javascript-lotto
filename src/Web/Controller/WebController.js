import LottoService from "../Service/LottoService.js";
import LottoView from "../View/LottoView.js";
import PurchaseView from "../View/PurchaseView.js";
import WinningFormView from "../View/WinningFormView.js";
import ModalView from "../View/ModalView.js";

export default class WebController {
  constructor() {
    this.service = new LottoService(); // 비즈니스 로직

    this.purchaseView = new PurchaseView();
    this.lottoView = new LottoView();
    this.winningFormView = new WinningFormView();
    this.modalView = new ModalView();
  }

  init() {
    this.purchaseView.bindPurchase(this.handlePurchase.bind(this));
    this.winningFormView.bindCheckResult(this.handleResult.bind(this));
    this.modalView.bindClose(this.handleCloseModal.bind(this));
    this.modalView.bindRestart(this.handleRestart.bind(this));
  }

  // 1. 구매
  handlePurchase(amount) {
    try {
      const lottos = this.service.purchaseLottos(amount);

      this.lottoView.renderLottos(lottos);
      this.purchaseView.clearError();
      this.winningFormView.show();
    } catch (error) {
      this.purchaseView.showError(error.message);
    }
  }

  // 2. 결과 확인
  handleResult({ winningNumbers, bonusNumber }) {
    try {
      const { statistics, yieldRate } = this.service.calculateResult(
        winningNumbers,
        bonusNumber
      );

      this.winningFormView.clearError();
      this.modalView.renderStatistics(statistics);
      this.modalView.renderRate(yieldRate);
      this.modalView.open();
    } catch (error) {
      this.winningFormView.showError(error.message);
    }
  }

  handleCloseModal() {
    this.modalView.close();
  }

  handleRestart() {
    this.modalView.close();
    this.winningFormView.clearInputs();
    this.winningFormView.hide();
    this.purchaseView.clearInput();
  }
}
