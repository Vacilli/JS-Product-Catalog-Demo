'use strict';

/////////////////////////// VARIABLES /////////////////////////////////

const slidesContainer = document.getElementById('slider');
const slides = document.getElementsByClassName('slider__slide');
const slidesNav = document.getElementById('navigation');
const navlinks = document.getElementsByClassName('slider__navlink');
const searchBox = document.querySelector(".search__box > input");
const searchIcon = document.querySelector(".search__box > i");
const closeIcon = document.querySelector("div.search__box > i.fa-magnifying-glass");
const catalogWrapper = document.querySelector('.catalog-wrapper');
const productContainer = document.querySelector('.products');
const popup = document.getElementsByClassName('popup-wrapper');
const popupContainer = document.getElementById('popup');


const pageSize = 5;
// const numPages = 4
// let numPages = Math.floor(([...slides].length + pageSize - 1) / pageSize)

let position = 0;  
let activePage = 1;
let activeSlides, currentSlides, currentPagination, numPages, popUpData, productCatalog;

const typeSelect = document.getElementById('filter');

/////////////////////////// CATALOG /////////////////////////////////

const renderProduct = function (data, className = '') {
    const slides = `
    <div class="slider__slide${className}">
        <div class="tooltip">
            <span class="tooltiptext">${data.Name}</span>
        </div>
        <img class="slide-img" src="${data.Images[0].url}" alt="${data.Name}" />
    </div>`;
    slidesContainer.insertAdjacentHTML('beforeend', slides);
}

const renderPopup = function (data) {
    const popupContent = `
        <div class="close-btn">
            <span>x</span>
        </div>
        <div class="popup-wrapper">
            <div class="product-info">
                <h2>Product Info</h2>
                <p><strong>Product Name: </strong> ${data.Name}</p>
                <p><strong>Product Type: </strong> ${data.Type}</p>
                <p><strong>Vendor: </strong> ${data.Vendor}</p>
                <p><strong>In Stock: </strong> ${data[`In stock`]}</p>
                <p><strong>Unit Cost: </strong> ${data[`Unit cost`]}</p>
                <p><strong>Size: </strong> ${data[`Size (WxLxH)`]}</p>
            </div>
            <div class="product-img">
                <img class="slide-img" src="${data.Images[0].url}" alt="${data.Name}" />
            </div>
        </div>`;
        popupContainer.insertAdjacentHTML('beforeend', popupContent);
}

const renderPagination = function (className = '') {
    const bullets = `<div class="slider__navlink${className}"></div>`;
    slidesNav.insertAdjacentHTML('beforeend', bullets);
}

const loadAnimation = function() {
    const html = `<div class="loading">Loading&#8230;</div>`
    slidesContainer.insertAdjacentHTML('beforeend', html);
}

// creates x number of pagination bullets depending on number of pages 
const paginationConstructor = (times) => {
    // run x number of times
    [...Array(times)].forEach((element, index) => {
        (index == 0) ? renderPagination(' active') : renderPagination()
    });
}

// sets and shows ONLY active slides
const activeSlideBuilder = function (allElements, elementClass, position) {
    activeSlides = getPage(allElements, pageSize, position + 1)
    resetClass(allElements, elementClass)
    setActiveElements(activeSlides, elementClass)
}

// sets and shows ONLY active pagination
const activePaginationBuilder = function (allElements, elementClass, position) {
    resetClass(allElements, elementClass)
    setActiveElements(allElements[position], elementClass)
}

// clear active class from elements
const resetClass = function (allElements, elementClass) {
    allElements.forEach((element) => {
        (element.classList.contains(elementClass)) ? element.classList.toggle(elementClass) : false
    })
}

// clear active class from elements
const removeChildren = function (elementParent) {
    while (elementParent.firstChild) {
        elementParent.removeChild(elementParent.firstChild);
    }
}

// set active class for pagination and slides
const setActiveElements = function (activeElements, elementClass) {
    if (activeElements.length > 0) {
        // Add active class to multiple active elements e.g Slides
        activeElements.forEach((element) => {
            element.classList.toggle(elementClass)
        })
    } else {
        // Add active class to single active element e.g Pagination
        activeElements.classList.toggle(elementClass)
    }
}

// Search for word
const hasWord = (str, word) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(/\s+/).includes(word);

// Round numbers
const roundNum = (expresion) => Math.floor(expresion);

const getProductData = function() {
    loadAnimation()
    fetch(`https://api.airtable.com/v0/appElurJfZ2WmdIUg/Furniture/?api_key=keys1gmUsZYDi7y0g`)
    .then(response => {
        console.log(response)
        return response.json()
    })
    .then(data => {
        productCatalog = ([data][0].records)
        console.log(productCatalog)
        
        productCatalog.forEach((element, index) => {
            // Render the first 5 products and set them as 'active' 
            (index >= 0 && index <= pageSize - 1) ? renderProduct([element][0].fields, ` active`) : renderProduct([element][0].fields)
        })
        
        paginationConstructor(roundNum((getPageCount([...slides]) + pageSize - 1) / pageSize))
        Promise.resolve(document.querySelector('.loading').remove())

        // return productCatalog
    })
    .catch(err => {
        console.error(`${err} 💥💥💥`)
        // renderError(`Something went wrong 💥💥 ${err.message}. Try again!`);
    })
}
getProductData();

/////////////////////////// eventListeners /////////////////////////////////

// check if filter is selected
typeSelect.addEventListener('change', (e) => {
    // Clear slides and nav bullets
    removeChildren(slidesContainer)
    removeChildren(slidesNav)

    productCatalog.forEach((element, index) => {
        // render all elements
        if (e.target.value == 'All' || e.target.value == '') (index >= 0 && index <= pageSize - 1) ? renderProduct([element][0].fields, ` active`) : renderProduct([element][0].fields)
        // render all matching elements with the selected value 
        if([element][0].fields.Type == e.target.value) renderProduct([element][0].fields, ` active`)
    })

    // if number of slides is greater than pagesize then render navigation
    if (getPageCount([...slides]) >= pageSize) paginationConstructor(roundNum((getPageCount([...slides]) + pageSize - 1) / pageSize))
})

// listen event for keyup on the search box 
searchBox.addEventListener("keyup", (e) => {
    typeSelect.value = ''
    typeSelect.disabled = true

    const searchVal = e.target.value.toLowerCase()
    let matchCounter = 0

    // Clear slides and nav bullets
    removeChildren(slidesContainer)
    removeChildren(slidesNav)

    productCatalog.forEach((element, index) => {
        let productName = [element][0].fields.Name.toLowerCase();
        // render elements that contain the search word 
        if (hasWord(productName, searchVal)) {
            matchCounter++
            // add active to first 5 elements to render 
            (matchCounter <= pageSize) ? renderProduct([element][0].fields, ` active`) : renderProduct([element][0].fields)
        } else if (e.target.value == '') { 
            (index >= 0 && index <= pageSize - 1) ? renderProduct([element][0].fields, ` active`) : renderProduct([element][0].fields)
            typeSelect.disabled = false
        }    
    })

    // if number of slides is greater than pagesize then render navigation
    if (getPageCount([...slides]) >= pageSize) paginationConstructor(roundNum((getPageCount([...slides]) + pageSize - 1) / pageSize))
})

slidesContainer.addEventListener('click', (e) => {
    removeChildren(popupContainer)
    console.log('pop up clicked', e.target)
    popupContainer.classList.toggle('show') 
    productCatalog.forEach((element) => {
        console.log(element.fields.Name, e.target.getAttribute('alt'))
        if (element.fields.Name == e.target.getAttribute('alt')) {
            popUpData = element.fields;
            console.log(true, [element][0].fields)
            return popUpData
        }
    })
    renderPopup(popUpData)
})

document.getElementById("nav-button--next").addEventListener("click", () => {
    if (navlinks.length > 1) next()
});

document.getElementById("nav-button--prev").addEventListener("click", () => {
    if (navlinks.length > 1) prev()
});

// listen event for focusin on the search box 
searchBox.addEventListener("focusin", (e) => {
    searchIcon.removeAttribute('class')
    searchIcon.classList.add('fa-solid', 'fa-xmark')
})

// listen event for blur on the search box 
searchBox.addEventListener("blur", (e) => {
    searchIcon.removeAttribute('class')
    searchIcon.classList.add('fa-solid', 'fa-magnifying-glass')
})

closeIcon.addEventListener("click", () => {
    searchBox.value = ''
    typeSelect.disabled = false
    typeSelect.value = ''
})

slidesNav.addEventListener("click", (e) => {
    let clickedBullet = e.target;

    [...navlinks].forEach((element, index) => {
        if(clickedBullet == element){
            activeSlideBuilder([...slides], 'active', index)
            activePaginationBuilder([...navlinks], 'active', index)

            // set current position to clicked navigation bullet
            return position = index
        }
    })
});

function next() {
    numPages = roundNum(([...slides].length + pageSize - 1) / pageSize)
    position++;
    if(position < numPages) {
        activeSlideBuilder([...slides], 'active', position)
        activePaginationBuilder([...navlinks], 'active', position)
    } else {
        position = 0;
        activeSlideBuilder([...slides], 'active', position)
        activePaginationBuilder([...navlinks], 'active', position)
    }
    console.log('position ' + position)
    return position
}

function prev() {
    numPages = roundNum(([...slides].length + pageSize - 1) / pageSize)
    position--;
    if(position >= 0) {
        activeSlideBuilder([...slides], 'active', position)
        activePaginationBuilder([...navlinks], 'active', position)
    } else {
        position = numPages - 1;
        activeSlideBuilder([...slides], 'active', position)
        activePaginationBuilder([...navlinks], 'active', position)
    }
    console.log('position ' + position)
    return position
}


/////////////////////////// PAGINATION /////////////////////////////////

// return number of elements(slides)
const getPageCount = function (dataSource) {
    return dataSource.length;
}

// return current page's elements(slides)
const getPage = function (dataSource, pageSize, activePage) {
    return dataSource.slice((activePage-1) * pageSize, activePage * pageSize);
}

/////////////////////////// Pop Up /////////////////////////////////

// document.getElementById('slider').addEventListener('click', () => {
//     console.log('pop up clicked')
//     document.querySelector('.popup-box').classList.toggle('show') 
// })



/////////////////////////// When DOM's Loaded /////////////////////////////////

document.addEventListener("DOMContentLoaded", function() {
    // reset select to default option 
    typeSelect.value = ''
    searchBox.value = ''
    // numPages = getPageCount([...slides].length + pageSize - 1 / pageSize);
    // console.log('number of pages ' + numPages)
    console.log([...slides].length)
})