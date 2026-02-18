const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "123456";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const loginSection = document.getElementById("login-section");
const appSection = document.getElementById("app-section");
const loginForm = document.getElementById("login-form");
const loginFeedback = document.getElementById("login-feedback");

function money(value) {
  return BRL.format(value || 0);
}

function supervisorRateByPrice(price) {
  if (price >= 1.3) return 0.01;
  if (price >= 1.2) return 0.02;
  if (price >= 1.1) return 0.03;
  if (price >= 1.0) return 0.04;
  if (price >= 0.9) return 0.05;
  if (price >= 0.8) return 0.06;
  return 0;
}

function collectorRateByPrice(price) {
  if (price >= 1.3) return 0.02;
  if (price >= 1.2) return 0.03;
  if (price >= 1.1) return 0.04;
  if (price >= 1.0) return 0.06;
  if (price >= 0.9) return 0.08;
  if (price >= 0.8) return 0.1;
  return 0;
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
    loginFeedback.className = "feedback ok";
    loginFeedback.textContent = "Acesso liberado.";
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    return;
  }

  loginFeedback.className = "feedback error";
  loginFeedback.textContent = "Usuário ou senha inválidos.";
});

const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tabButton) => {
  tabButton.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tabContents.forEach((item) => item.classList.remove("active"));
    tabButton.classList.add("active");
    document.getElementById(tabButton.dataset.tab).classList.add("active");
  });
});

document.getElementById("supervisor-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const meta = Number(document.getElementById("sup-meta").value);
  const volume = Number(document.getElementById("sup-volume").value);
  const price = Number(document.getElementById("sup-price").value);
  const flashOk = document.getElementById("sup-flash-ok").checked;
  const managerOverride = document.getElementById("sup-manager-override").checked;

  const metaPct = meta > 0 ? volume / meta : 0;
  const goalRate = metaPct >= 0.8 ? 0.02 : 0;
  const goalCommission = volume * goalRate;

  const qualityEligible = flashOk || managerOverride;
  const qualityRate = qualityEligible ? 0.01 : 0;
  const qualityCommission = volume * qualityRate;

  const priceRate = supervisorRateByPrice(price);
  const priceCommission = volume * priceRate;

  const total = goalCommission + qualityCommission + priceCommission;

  document.getElementById("supervisor-result").innerHTML = `
    <strong>Total Supervisor: <span class="money">${money(total)}</span></strong>
    <ul>
      <li>Meta (${(metaPct * 100).toFixed(2)}%): ${money(goalCommission)} (taxa ${money(goalRate)}/L)</li>
      <li>Qualidade (${qualityEligible ? "aprovada" : "não aprovada"}): ${money(qualityCommission)} (taxa ${money(qualityRate)}/L)</li>
      <li>Valor de compra (R$ ${price.toFixed(4)}): ${money(priceCommission)} (taxa ${money(priceRate)}/L)</li>
    </ul>
  `;
});

document.getElementById("coletor-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const volume = Number(document.getElementById("col-volume").value);
  const volumePrev = Number(document.getElementById("col-volume-prev").value);
  const price = Number(document.getElementById("col-price").value);

  const metaOk = document.getElementById("col-meta-ok").checked;
  const fuelAvgOk = document.getElementById("col-fuel-avg-ok").checked;
  const consumptionLOk = document.getElementById("col-consumption-l-ok").checked;
  const maintenanceOk = document.getElementById("col-maintenance-ok").checked;

  const c1 = volume * 0.01;
  const c2 = metaOk ? volumePrev * 0.01 : 0;
  const c3 = fuelAvgOk ? volume * 0.02 : 0;
  const c4 = consumptionLOk ? volume * 0.01 : 0;
  const c5 = maintenanceOk ? volume * 0.01 : 0;

  const priceRate = collectorRateByPrice(price);
  const c6 = volume * priceRate;

  const total = c1 + c2 + c3 + c4 + c5 + c6;

  document.getElementById("coletor-result").innerHTML = `
    <strong>Total Coletor: <span class="money">${money(total)}</span></strong>
    <ul>
      <li>1) Comissão s/ coleta: ${money(c1)}</li>
      <li>2) Comissão s/ volume mensal atingido: ${money(c2)}</li>
      <li>3) Comissão s/ consumo médio: ${money(c3)}</li>
      <li>4) Comissão s/ consumo por litro: ${money(c4)}</li>
      <li>5) Comissão s/ manutenção e conservação: ${money(c5)}</li>
      <li>6) Comissão s/ valor médio de compra: ${money(c6)} (taxa ${money(priceRate)}/L)</li>
    </ul>
  `;
});
