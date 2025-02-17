'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2025-02-15T14:49:59.371Z',
    '2025-02-17T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  // weekday: 'long',
};
const locale = navigator.language;

const overAllBalance = accounts
  .flatMap(item => item.movements)
  .reduce((acc, item) => acc + item, 0);
console.log(overAllBalance);

const computeUsername = function (accounts) {
  accounts.forEach(item => {
    item.username = item.owner
      .split(' ')
      .map(items => items[0].toLowerCase())
      .join('');
  });
};

const formatDate = function (account, dates) {
  const today = new Date();
  const date = new Date(dates);
  const diff = Math.round((today - date) / (24 * 60 * 60 * 1000));
  console.log(diff);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff <= 7) return `${diff} days ago`;
  return new Intl.DateTimeFormat(account.locale).format(date);
};

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  movs.forEach((item, index) => {
    const transactionType = item < 0 ? 'withdrawal' : 'deposit';
    const content = `<div class="movements__row">
    <div class="movements__type movements__type--${transactionType}">${
      index + 1
    } ${transactionType}</div>
          <div class="movements__date">${formatDate(
            account,
            account.movementsDates[index]
          )}</div>
          <div class="movements__value">${formatNumber(account, item)}</div>
        </div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', content);
  });
  document.querySelectorAll('.movements__row').forEach((item, index) => {
    if (index % 2 === 0) {
      item.style.backgroundColor = 'hsl(0, 6%, 93%)';
    }
  });
};
const formatNumber = function (account, number) {
  const currOptions = {
    style: 'currency',
    currency: account.currency,
  };
  return new Intl.NumberFormat(account.locale, currOptions).format(
    +number.toFixed(2)
  );
};
const computeBalance = function (account) {
  account.balance = account.movements.reduce((acc, item) => acc + item, 0);
  labelBalance.textContent = formatNumber(account, account.balance);
};

const calcDisplaySummary = function (account) {
  const deposit = account.movements
    .filter(item => item > 0)
    .reduce((acc, item) => acc + item, 0);
  const withdrawal = account.movements
    .filter(item => item < 0)
    .reduce((acc, item) => acc + Math.abs(item), 0);

  const interest = account.movements
    .filter(item => item > 0)
    .map(item => (account.interestRate / 100) * item)
    .filter(item => item >= 1)
    .reduce((acc, item) => acc + item);
  labelSumIn.textContent = formatNumber(account, deposit);
  labelSumOut.textContent = formatNumber(account, withdrawal);
  labelSumInterest.textContent = formatNumber(account, interest);
};

const updateUI = function (account) {
  displayMovements(account);
  computeBalance(account);
  calcDisplaySummary(account);
};

const findAccount = function (accounts, userName, pin) {
  return accounts.find(item => item.username === userName && item.pin === pin);
};

const returnToLogin = () => {
  containerApp.style.opacity = '0';
  labelWelcome.textContent = 'Log in to get started';
};
let interval;

const startTimer = function (value) {
  let timer = value;
  labelTimer.textContent = `${`${Math.floor(timer / 60)}`.padStart(2, 0)}:${`${
    timer % 60
  }`.padStart(2, 0)}`;
  interval = setInterval(() => {
    labelTimer.textContent = `${`${Math.floor(timer / 60)}`.padStart(
      2,
      0
    )}:${`${timer % 60}`.padStart(2, 0)}`;

    if (timer === 0) {
      clearInterval(interval);
      setTimeout(() => {
        alert('Session terminated, please login again');
      }, 0);
      returnToLogin();
      return;
    }
    timer--;
  }, 1000);
  return interval;
};

let account;

btnLogin.addEventListener('click', e => {
  e.preventDefault();
  containerApp.style.opacity = 0;

  setTimeout(() => {
    computeUsername(accounts);
    const userName = inputLoginUsername.value;
    const pin = +inputLoginPin.value;

    // Clear input fields
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();

    account = findAccount(accounts, userName, pin);
    if (account) {
      if (interval) clearInterval(interval);
      startTimer(600);

      labelWelcome.textContent = `Welcome ${account.owner.split(' ')[0]}!`;

      const date = new Date();
      labelDate.textContent = new Intl.DateTimeFormat(
        account.locale,
        options
      ).format(date);

      updateUI(account);
      const eleArr = Array.from(
        document.querySelectorAll('.movements__value'),
        ele => ele.textContent
      );

      setTimeout(() => {
        containerApp.style.opacity = '1';
      }, 100);
    }
  }, 500); // Small delay before updating content
});

btnTransfer.addEventListener('click', f => {
  f.preventDefault();
  clearInterval(interval);
  interval = startTimer(600, true);

  const receiverAccount = accounts.find(
    item => item.username === inputTransferTo.value
  );
  const receiverAmount = +inputTransferAmount.value;
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
  if (
    receiverAccount &&
    receiverAccount.owner != account.owner &&
    receiverAmount > 0 &&
    receiverAmount <= account.balance
  ) {
    const date = new Date();
    account.movements.push(0 - receiverAmount);
    account.movementsDates.push(date.toISOString());
    receiverAccount.movements.push(receiverAmount);
    receiverAccount.movementsDates.push(date.toISOString());
    updateUI(account);
  }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  clearInterval(interval);
  interval = startTimer(600, true);
  const loanAmount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
  if (
    loanAmount > 0 &&
    account.movements.some(item => item >= 0.1 * loanAmount)
  ) {
    setTimeout(() => {
      containerApp.style.opacity = '1';
      labelWelcome.textContent = 'Loan Added!';
      setTimeout(() => {
        labelWelcome.textContent = `Welcome ${account.owner.split(' ')[0]}!`;
      }, 2500);

      const date = new Date();
      account.movementsDates.push(date.toISOString());
      account.movements.push(loanAmount);
      updateUI(account);
    }, 2500);
    containerApp.style.opacity = '0';
    labelWelcome.textContent = 'Processing...';
  }
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  const userName = inputCloseUsername.value;
  const pin = +inputClosePin.value;
  const accountIndex = accounts.findIndex(
    item => item.username == userName && item.pin === pin
  );
  inputCloseUsername.value = inputClosePin.value = '';
  if (accountIndex === accounts.indexOf(account)) {
    const confirm = Number(
      prompt(
        `Do you really wanna delete the account:\nAccount owner: ${account.owner}? (Type 1 or 0)`
      )
    );
    if (confirm) {
      alert('Account Deleted');
      accounts.splice(accountIndex, 1);
      console.log(accounts);
      returnToLogin();
    }
  }
});

let sort = false;

btnSort.addEventListener('click', () => {
  sort = !sort;
  displayMovements(account, sort);
});

const rolls = Array.from(
  { length: 100 },
  () => Math.trunc(Math.random() * 6) + 1
);
console.log(rolls);

const bankDepositSum = accounts
  .flatMap(item => item.movements)
  .filter(item => item > 0)
  .reduce((acc, item) => acc + item, 0);
console.log(bankDepositSum);

const countThousandDeposits = accounts
  .flatMap(item => item.movements)
  .reduce((acc, item) => (item >= 1000 ? acc + 1 : acc), 0);
console.log(countThousandDeposits);

const sumDepositsWithdrawals = accounts
  .flatMap(item => item.movements)
  .reduce(
    (obj, item) => {
      obj[item > 0 ? 'deposits' : 'withdrawals'] += item;
      return obj;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(
  sumDepositsWithdrawals.deposits,
  sumDepositsWithdrawals.withdrawals
);

const convertTitleCase = function (str) {
  const exceptions = ['a', 'an', 'the'];
  return str
    .toLowerCase()
    .split(' ')
    .map(item =>
      !exceptions.includes(item)
        ? item.replace(item[0], item[0].toUpperCase())
        : item
    )
    .join(' ');
};
console.log(convertTitleCase('this IS A nice title AND An allegator'));
