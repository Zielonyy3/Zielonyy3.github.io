const generalBtn = document.querySelector('.general-info-btn');
const vehicleBtn = document.querySelector('.vehicle-info-btn');
const moreBtn = document.querySelector('.more-info-btn');
const cardsList = document.querySelectorAll('.info-card');
const buttonsList = document.querySelectorAll('.switch-btn');
const refreshBtn = document.querySelector('#refresh');
const showFullScreen = document.querySelector('.show-fullscreen');
const navBarBtn = document.querySelector('.nav-btn');
const navEmptySpace = document.querySelector('.nav-empty-space');


navBarBtn.addEventListener('click', toggleNavMenu);
navEmptySpace.addEventListener('click', toggleNavMenu);

function toggleNavMenu() {
    const navContainer = document.querySelector('.nav-container');
    const navbar = document.querySelector('.navbar');
    const navEmpty = document.querySelector('.nav-empty-space');

    const compNavBar = window.getComputedStyle(navbar);
    let duration = compNavBar.getPropertyValue('transition-duration')
    duration = duration.substring(0, duration.indexOf('s'));

    if (navbar.classList.contains('navbar-hidden') && navContainer.classList.contains('micro')) {
        navContainer.classList.remove('micro')
        navBarBtn.classList.add('navbar-shown-btn');
        navbar.classList.remove('navbar-hidden');
        navEmpty.classList.remove('navbar-hidden');
    } else if (!navbar.classList.contains('navbar-hidden')) {
        navBarBtn.classList.remove('navbar-shown-btn');
        navbar.classList.add('navbar-hidden');
        navEmpty.classList.add('navbar-hidden');
        setTimeout(() => navContainer.classList.add('micro'), duration * 1000);
    } else {
        console.warn('NavBar aktualnie w użyciu')
    }

}
showFullScreen.addEventListener('click', showFullScreenMap)

function showFullScreenMap(e) {
    const mapDiv = document.querySelector('#mapid');
    if (this.children[0].classList.contains('fa-chevron-down')) {
        this.removeEventListener('click', showFullScreenMap);
        this.children[0].classList.remove('fa-chevron-down');
        this.children[0].classList.add('fa-chevron-up');
        mapDiv.classList.add('fullscreen-map');
        setTimeout(() => this.addEventListener('click', showFullScreenMap), 0.2 * 1000)
    } else {
        this.removeEventListener('click', showFullScreenMap);
        this.children[0].classList.remove('fa-chevron-up');
        this.children[0].classList.add('fa-chevron-down');
        mapDiv.classList.remove('fullscreen-map');
        setTimeout(() => this.addEventListener('click', showFullScreenMap), 0.2 * 1000)
    }
}
refreshBtn.addEventListener('click', e => {
    const icon = document.querySelector('#refresh+i');
    if (!icon.classList.contains('refresh-animation')) {
        icon.classList.add('refresh-animation')
        const compIcon = window.getComputedStyle(icon);
        let duration = compIcon.getPropertyValue('animation-duration')
        duration = duration.substring(0, duration.length - 1)
        setTimeout(() => icon.classList.remove('refresh-animation'), duration * 1000);
    } else
        console.warn('Animacja w trakcie!');
})

generalBtn.addEventListener('click', e => {
    e.preventDefault();
    switchInfoCard(e.target, 'general-info')
});
vehicleBtn.addEventListener('click', e => {
    e.preventDefault();
    switchInfoCard(e.target, 'vehicle-info')
});
moreBtn.addEventListener('click', e => {
    e.preventDefault();
    switchInfoCard(e.target, 'more-info')
});



function switchInfoCard(button, cardName) {
    cardsList.forEach(el => el.classList.add('no-active'))
    buttonsList.forEach(el => el.classList.remove('active-swtich-btn'));
    button.classList.add('active-swtich-btn');
    const card = document.querySelector(`.${cardName}-card`);
    card.classList.remove('no-active')
}

const informationContainer = document.querySelector('#info-container');
const switchButtons = document.querySelectorAll('.switch-btn');
switchButtons.forEach(btn => {
    // btn.addEventListener('click', )
})