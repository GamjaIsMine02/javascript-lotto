(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const html$6 = String.raw;
class Header extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  render() {
    this.innerHTML = html$6`
      <div class="header-container">
        <div class="header-text-box">🎱 행운의 로또</div>
      </div>
    `;
  }
}
customElements.define("lotto-header", Header);
const ERROR_MESSAGE = Object.freeze({
  NOT_NUMBER: "숫자가 아닙니다.",
  INVALID_AMOUNT: "1000원 단위가 아닙니다.",
  INVALID_NUMBER_RANGE: "모든 번호는 1부터 45사이의 숫자여야 합니다.",
  MUST_BE_INTEGER: "모든 번호는 정수여야 합니다.",
  INVALID_NUMBER_LENGTH: "로또 번호는 6개의 숫자가 존재하고 콤마로 구분되어야 합니다.",
  MUST_BE_NOT_DUPLICATE: "로또 번호는 중복될 수 없습니다.",
  MUST_BE_NOT_DUPLICATE_WITH_WINNINGNUMBER: "보너스 번호는 당첨 번호와 중복될 수 없습니다."
});
class Validator {
  validatePrice(price) {
    if (isNaN(price)) {
      throw new Error(ERROR_MESSAGE.NOT_NUMBER);
    }
    if (price % 1e3 !== 0 || price <= 0) {
      throw new Error(ERROR_MESSAGE.INVALID_AMOUNT);
    }
  }
  validateLottoNumber(number) {
    if (number < 1 || number > 45)
      throw new Error(ERROR_MESSAGE.INVALID_NUMBER_RANGE);
    if (isNaN(number)) throw new Error(ERROR_MESSAGE.NOT_NUMBER);
    if (!Number.isInteger(number))
      throw new Error(ERROR_MESSAGE.MUST_BE_INTEGER);
  }
  validateLottoNumbers(numbers) {
    if (numbers.length !== 6) {
      throw new Error(ERROR_MESSAGE.INVALID_NUMBER_LENGTH);
    }
    const set = new Set(numbers);
    if (set.size !== numbers.length) {
      throw new Error(ERROR_MESSAGE.MUST_BE_NOT_DUPLICATE);
    }
    numbers.forEach((number) => {
      this.validateLottoNumber(number);
    });
  }
  validateBonusNumber(lottoNumbers, bonusNumber) {
    this.validateLottoNumber(bonusNumber);
    if (lottoNumbers.includes(bonusNumber))
      throw new Error(ERROR_MESSAGE.MUST_BE_NOT_DUPLICATE_WITH_WINNINGNUMBER);
  }
}
const random = {
  randomArray: (startNum, endNum, count) => {
    if (count > endNum - startNum + 1) return;
    let randomArray = [];
    for (let i = 0; i < count; i++) {
      const randomNum = Math.floor(Math.random() * (endNum - startNum + 1)) + startNum;
      if (randomArray.indexOf(randomNum) === -1) randomArray.push(randomNum);
      else i--;
    }
    randomArray.sort((a, b) => a - b);
    return randomArray;
  }
};
class Lotto {
  #numbers;
  constructor(numbers) {
    this.#numbers = numbers;
  }
  getNumbers() {
    return [...this.#numbers];
  }
  toString() {
    return `[${this.#numbers.join(", ")}]`;
  }
}
class LottoList {
  #lottos;
  constructor(amount) {
    this.#lottos = this.#createLottoList(amount);
  }
  #createLottoList(amount) {
    const lottos = Array.from({ length: amount }).map(() => {
      return new Lotto(this.#createRandomArray());
    });
    return lottos;
  }
  #createRandomArray() {
    return random.randomArray(1, 45, 6);
  }
  getLottoList() {
    return this.#lottos;
  }
}
class LottoGame {
  #winningNumbers;
  #bonusNumber;
  constructor(winningNumbers, bonusNumber) {
    this.#winningNumbers = winningNumbers;
    this.#bonusNumber = bonusNumber;
  }
  calculateStatistics(lottoList) {
    const grade = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 0: 0 };
    lottoList.getLottoList().forEach((lotto) => {
      const gradeNum = this.#match(lotto);
      grade[gradeNum]++;
    });
    return grade;
  }
  #calculateMatchCount(lotto) {
    let matchingCount = 0;
    let hasBonus = false;
    lotto.getNumbers().forEach((number) => {
      if (this.#winningNumbers.includes(number)) {
        matchingCount++;
      }
    });
    if (lotto.getNumbers().includes(this.#bonusNumber)) hasBonus = true;
    return {
      matchingCount,
      hasBonus
    };
  }
  #match(lotto) {
    const { matchingCount, hasBonus } = this.#calculateMatchCount(lotto);
    if (matchingCount === 6) return 1;
    if (matchingCount === 5 && hasBonus) return 2;
    if (matchingCount === 5) return 3;
    if (matchingCount === 4) return 4;
    if (matchingCount === 3) return 5;
    return 0;
  }
  getBonusNumber() {
    return this.#bonusNumber;
  }
  getWinningNumbers() {
    return [...this.#winningNumbers];
  }
}
const PRIZE_MONEY = Object.freeze({
  0: 0,
  5: 5e3,
  4: 5e4,
  3: 15e5,
  2: 3e7,
  1: 2e9
});
class Rate {
  #price;
  #statistics;
  constructor(statistics, price) {
    this.#statistics = statistics;
    this.#price = price;
  }
  #getTotal() {
    return Object.entries(this.#statistics).reduce((acc, [grade, count]) => {
      acc += PRIZE_MONEY[grade] * count;
      return acc;
    }, 0);
  }
  getRate() {
    const total = this.#getTotal();
    const rate = total / this.#price * 100;
    return Math.round(rate * 10) / 10;
  }
}
const html$5 = String.raw;
class MainApp extends HTMLElement {
  #validator;
  #isShowLottos;
  #isOpenModal;
  #purchaseAmount;
  #purchaseError;
  #lottoList;
  #lottoGame;
  #winningError;
  #statistics;
  #rate;
  constructor() {
    super();
    this.#validator = new Validator();
    this.#isShowLottos = false;
    this.#isOpenModal = false;
    this.#purchaseAmount = 0;
    this.#purchaseError = "";
    this.#winningError = "";
  }
  connectedCallback() {
    this.render();
  }
  render() {
    this.innerHTML = html$5`<div class="main-container">
      <div class="card-container">
        <!-- 1. 헤더 -->
        <div class="card-header">🎱 내 번호 당첨 확인 🎱</div>

        <!--  2. 구입 금액 입력 폼 -->
        <lotto-purchase error="${this.#purchaseError}"></lotto-purchase>

        <div class="card-hidden-section" ${this.#isShowLottos ? "" : "hidden"}>
          <!-- 3. 구입 로또 -->
          <lotto-lottos></lotto-lottos>

          <!-- 4. 당첨 번호 & 보너스 번호 입력 폼 -->
          <lotto-user-lotto error="${this.#winningError}"></lotto-user-lotto>
        </div>

        <!-- 결과 모달 -->
        <lotto-statistics-modal></lotto-statistics-modal>
      </div>
    </div>`;
    const lottosEl = this.querySelector("lotto-lottos");
    if (lottosEl && this.#lottoList) {
      lottosEl.lottoList = this.#lottoList;
    }
    const modalEl = this.querySelector("lotto-statistics-modal");
    if (modalEl) {
      modalEl.open = this.#isOpenModal;
      modalEl.statistics = this.#statistics;
      modalEl.rate = this.#rate;
    }
    this.querySelector("lotto-purchase").addEventListener(
      "purchase",
      (event) => {
        this.#isShowLottos = false;
        try {
          const { purchase } = event.detail;
          this.#validator.validatePrice(purchase);
          this.#purchaseAmount = purchase / 1e3;
          this.#purchaseError = "";
          this.#lottoList = new LottoList(this.#purchaseAmount);
          this.#isShowLottos = true;
        } catch (error) {
          this.#purchaseError = error.message;
        }
        this.render();
      }
    );
    this.querySelector("lotto-user-lotto").addEventListener(
      "result",
      (event) => {
        this.#isOpenModal = false;
        try {
          const { winningNumber, bonusNumber } = event.detail;
          this.#validator.validateLottoNumbers(winningNumber);
          this.#validator.validateBonusNumber(winningNumber, bonusNumber);
          this.#winningError = "";
          this.#lottoGame = new LottoGame(winningNumber, bonusNumber);
          this.#statistics = this.#lottoGame.calculateStatistics(
            this.#lottoList
          );
          this.#rate = new Rate(this.#statistics, this.#purchaseAmount * 1e3);
          this.#isOpenModal = true;
        } catch (error) {
          this.#winningError = error.message;
        }
        this.render();
      }
    );
    this.querySelector("lotto-statistics-modal").addEventListener(
      "close",
      () => {
        this.#isOpenModal = false;
        this.render();
      }
    );
    this.querySelector("lotto-statistics-modal").addEventListener(
      "restart",
      () => {
        this.#isShowLottos = false;
        this.#isOpenModal = false;
        this.render();
      }
    );
  }
}
customElements.define("lotto-main", MainApp);
const html$4 = String.raw;
class Purchase extends HTMLElement {
  static get observedAttributes() {
    return ["error"];
  }
  attributeChangedCallback() {
    this.render();
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const error = this.getAttribute("error") || "";
    this.innerHTML = html$4`
      <div class="card-input-container">
        <label class="input-label" for="purchase-amount">
          구입할 금액을 입력해주세요.
        </label>
        <form class="input-container">
          <input class="input-line" id="purchase-amount" placeholder="금액" />
          <button class="input-button">구입</button>
        </form>
        <a class="input-error" ${error ? "" : "hidden"}>${error}</a>
      </div>
    `;
    this.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const purchase = this.querySelector(".input-line").value;
      this.dispatchEvent(
        new CustomEvent("purchase", {
          detail: { purchase },
          bubbles: true
        })
      );
    });
  }
}
customElements.define("lotto-purchase", Purchase);
const html$3 = String.raw;
class Lottos extends HTMLElement {
  set lottoList(value) {
    this._lottoList = value;
    this.render();
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const lottos = this._lottoList?.getLottoList() ?? [];
    const count = lottos.length;
    this.innerHTML = html$3`
      <div class="lottos-container">
        <div class="lottos-container-header">
          총 ${count}개를 구매하셨습니다. <br />
          (로또 수가 많은 경우 스크롤을 내리세요.)
        </div>
        <div class="lottos-table">
          ${lottos.map(
      (lotto) => html$3`<div class="lotto-line">
                  <div class="lotto-line-icon">🎟️</div>
                  ${lotto.getNumbers().join(", ")}
                </div>`
    ).join("")}
        </div>
      </div>
    `;
  }
}
customElements.define("lotto-lottos", Lottos);
const html$2 = String.raw;
class UserLotto extends HTMLElement {
  static get observedAttributes() {
    return ["error"];
  }
  attributeChangedCallback() {
    this.render();
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const error = this.getAttribute("error") || "";
    this.innerHTML = html$2`
      <form class="userLotto-container">
            <label class="userLotto-header" for="winningNumber">
              지난 주 당첨번호 6개와 보너스 번호 1개를 입력해주세요.
            </label>
            <div class="input-container">
              <!-- 당첨 번호 -->
              <div class="winningNumber-container">
                <label
                  class="winningNumber-container-header"
                  for="winningNumber"
                >
                  당첨 번호
                </label>
                <div class="winningNumber-input-container">
                  <input
                    type="text"
                    id="winningNumber"
                    class="winningNumber-line"
                  />
                  <input type="text" class="winningNumber-line" />
                  <input type="text" class="winningNumber-line" />
                  <input type="text" class="winningNumber-line" />
                  <input type="text" class="winningNumber-line" />
                  <input type="text" class="winningNumber-line" />
                </div>
              </div>
              <div class="bonusNumber-container">
                <label class="bonusNumber-container-header" for="bonusNumber">
                  보너스 번호
                </label>

                <input type="text" id="bonusNumber" class="bonusNumber-line" />
              </div>
            </div>
          </div>

          <a class="input-error" ${error ? "" : "hidden"}>${error}</a>

          <!-- 결과 확인하기 버튼 -->
          <button class="result-button">결과 확인하기</button>
        </form>
    `;
    this.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const numbers = Array.from(this.querySelectorAll(".winningNumber-line")).map((el) => el.value.trim()).filter((v) => v !== "").map((v) => Number(v));
      const winningNumber = numbers;
      const bonusNumber = Number(this.querySelector(".bonusNumber-line").value);
      this.dispatchEvent(
        new CustomEvent("result", {
          detail: { winningNumber, bonusNumber },
          bubbles: true
        })
      );
    });
  }
}
customElements.define("lotto-user-lotto", UserLotto);
const html$1 = String.raw;
const prizeTable = [
  { label: "3개", prize: 5e3, grade: 5 },
  { label: "4개", prize: 5e4, grade: 4 },
  { label: "5개", prize: 15e5, grade: 3 },
  { label: "5개+보너스볼", prize: 3e7, grade: 2 },
  { label: "6개", prize: 2e9, grade: 1 }
];
class StatisticsModal extends HTMLElement {
  set open(value) {
    this._open = Boolean(value);
    this.render();
  }
  set statistics(value) {
    this._statistics = value;
    this.render();
  }
  set rate(value) {
    this._rate = value;
    this.render();
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const statistics = this._statistics ?? {};
    const rateValue = this._rate ? this._rate.getRate() : 0;
    this.innerHTML = html$1`<div
      class="result-modal-overlay"
      ${this._open ? "" : "hidden"}
    >
      <div class="modal">
        <button class="modal-close" aria-label="닫기">×</button>

        <div class="modal-header">🏆 당첨 통계 🏆</div>

        <div class="modal-table">
          <div class="row-header">
            <div>일치 갯수</div>
            <div>당첨금</div>
            <div>당첨 갯수</div>
          </div>
          ${prizeTable.map(
      (row) => html$1`<div class="row">
                  <div class="row-item">${row.label}</div>
                  <div class="row-item">
                    ${row.prize.toLocaleString("ko-KR")}
                  </div>
                  <div class="row-item">${statistics[row.grade] ?? 0}개</div>
                </div>`
    ).join("")}
        </div>

        <div class="benefit-messege">
          당신의 총 수익률은 ${rateValue.toLocaleString("ko-KR")}%입니다.
        </div>

        <button class="modal-restart">다시 시작하기</button>
      </div>
    </div>`;
    this.querySelector(".modal-close").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
    });
    this.querySelector(".modal-restart").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("restart", { bubbles: true }));
    });
  }
}
customElements.define("lotto-statistics-modal", StatisticsModal);
const html = String.raw;
class Footer extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  render() {
    this.innerHTML = html`
      <div class="footer-container">
        <div class="footer-text-box">Copyright 2023. woowacourse</div>
      </div>
    `;
  }
}
customElements.define("lotto-footer", Footer);
