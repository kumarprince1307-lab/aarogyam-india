/*==================================================
AAROGYAM INDIA
MY LIBRARY JS
VERSION : V1
==================================================*/


/*==================================================
CONFIG
==================================================*/

const BOOKS_JSON = "data/books.json";

const PURCHASES_JSON = "data/purchases.json";


/*==================================================
DOM
==================================================*/

const booksContainer =
document.getElementById("booksContainer");

const bookCount =
document.getElementById("bookCount");

const emptyState =
document.getElementById("emptyState");


/*==================================================
LOAD LIBRARY
==================================================*/

document.addEventListener(
"DOMContentLoaded",
loadLibrary
);


/*==================================================
MAIN FUNCTION
==================================================*/

async function loadLibrary(){

try{

showLoading();

const purchasesResponse =
await fetch(PURCHASES_JSON);

const purchasesData =
await purchasesResponse.json();

const booksResponse =
await fetch(BOOKS_JSON);

const booksData =
await booksResponse.json();

renderLibrary(
booksData,
purchasesData
);

}catch(error){

console.error(error);

showError();

}

}


/*==================================================
LOADING
==================================================*/

function showLoading(){

booksContainer.innerHTML=`

<div class="loading">

Loading Library...

</div>

`;

}


/*==================================================
ERROR
==================================================*/

function showError(){

booksContainer.innerHTML=`

<div class="loading">

Unable to Load Library

</div>

`;

}
/*==================================================
RENDER LIBRARY
==================================================*/

function renderLibrary(booksData,purchasesData){

const purchasedBooks=[];

const purchasedIds=
purchasesData.books || [];


purchasedIds.forEach(function(item){

const book=booksData.find(function(data){

return data.id===item.id;

});

if(book){

book.purchaseDate=item.purchaseDate;

purchasedBooks.push(book);

}

});


bookCount.textContent=purchasedBooks.length;


if(purchasedBooks.length===0){

booksContainer.innerHTML="";

emptyState.classList.remove("hidden");

return;

}


emptyState.classList.add("hidden");

booksContainer.innerHTML="";


purchasedBooks.forEach(function(book){

createBookCard(book);

});

}



/*==================================================
CREATE BOOK CARD
==================================================*/

function createBookCard(book){

const card=document.createElement("div");

card.className="book-card";


card.innerHTML=`

<img
src="${book.cover}"
alt="${book.name}">

<div class="book-content">

<h3>

${book.name}

</h3>

<div class="book-category">

${book.category}

</div>

<div class="purchase-date">

Purchased :
${book.purchaseDate}

</div>

<div class="book-actions">

<a
class="read-btn"
href="reader.html?id=${book.id}">

Read Now

</a>

<a
class="download-btn"
href="${book.pdf}"
download>

Download PDF

</a>

</div>

</div>

`;

booksContainer.appendChild(card);

}
