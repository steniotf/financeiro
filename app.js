// Modal popup
const Modal = {
  open() {
    //abrir modal
    //  adiciona a class active modal
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    // fechar modal
    //  remove a class active modal
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};
const Storage = {
  get() {
      return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
      localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
};
// TRANSACTIONS

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },
  incomes() {
    let income = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },
  expenses() {
    let expenses = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expenses += transaction.amount;
      }
    });
    return expenses;
  },
  total() {
    let total = 0;
    return Transaction.incomes() + Transaction.expenses();
  },
};
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transactions, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHtmlTransaction(transactions)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHtmlTransaction(transactions, index) {
    const Cssclass = transactions.amount > 0 ? "income" : "espense";

    const amount = Utils.formatCurrency(transactions.amount);

    const html = `            
      <td class="description">${transactions.description}</td>
      <td class="${Cssclass}">${amount}</td>
      <td class="date">${transactions.date}</td>
      <td>
        <img onclick=Transaction.remove(${index}) src="./assets/minus.svg" alt="Remover transação">
      </td>
       `;
    return html;
  },
  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100
    return value
  },
  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
    });
    return signal + value;
  },
};
// FORM, capturar os dados, digitados pelo usuário.
const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  formatData() { },
  validateFields() {
    const { description, amount, date } = Form.getValues()
    if (description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === "") {
      throw new Error("Por favor preencher todos os campos.")
    }
  },
  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },
  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      // Salvar 
      Transaction.add(transaction);
      // apagar os digitados
      Form.clearFields()
      // fechar Modal
      Modal.close()
      //atualizar aplicação
      App.reload()

    } catch (error) {
      alert(error.message)
    }
  },

};

   

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction)

    DOM.updateBalance();

    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
