const html = document.querySelector('html');


function darkMode() {
  const toggleDark = document.querySelector('#toggle-dark-mode');
  toggleDark.checked ? html.classList.add('dark-mode') : html.classList.remove('dark-mode')
}

const modal = document.querySelector('.modal-overlay');

function openModal() {
  modal.classList.add('active');
}
function closeModal() {
  modal.classList.remove('active');
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  },
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload();
  },

  incomes() {
    let totalIncomes = 0;
    Transaction.all.forEach(({ amount }) => {
      amount > 0 ? (totalIncomes += amount) : '';
    });
    return totalIncomes;
  },

  expenses() {
    let totalExpenses = 0;
    Transaction.all.forEach(({ amount }) => {
      amount < 0 ? (totalExpenses += amount) : '';
    });
    return totalExpenses;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};

const DOM = {
  transactionsContainer: document.querySelector('#data-tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction({ description, amount, date }, index) {
    const cssClass = amount > 0 ? 'income' : 'expense';
    const newAmount = Utils.formatCurrency(amount);
    const html = `
        <td class='description'>${description}</td>
        <td class='${cssClass}'>${newAmount}</td>
        <td class='date'>${date}</td> 
        <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transa????o">
        </td>
    `;
    return html;
  },

  updateBalance() {
    document.querySelector('#incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.querySelector('#expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  }
};

const Utils = {

  formatAmount(value) {
    value = Number(value) * 100;
    return value
  },

  formatDate(date) {
    const splittedDate = date.split('-');
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';
    value = String(value).replace(/\D/, '');
    value = Number(value) / 100;
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    return signal + value;
  },
};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields() {
    const { description, amount, date } = Form.getValues();
    if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
      throw new Error('Por favor, preencha todos os campos');
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

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
    event.preventDefault()
    try {
      // verificar se todas as informa????es foram preenchidas
      Form.validateFields();
      // Formatar os dados
      const transaction = Form.formatValues();
      //Salvar
      Transaction.add(transaction);
      // Limpar formul??rio
      Form.clearFields();
      closeModal();
    } catch (err) {
      console.log('Error: ' + err)
    }
  },
}

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

