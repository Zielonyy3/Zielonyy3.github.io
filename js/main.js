class NavBar {
    constructor(navContainerElement, navBarHamburgerButton) {
        this.navContainer = navContainerElement
        this.navBarElem = this.navContainer.querySelector('.navbar');
        this.formForFindVehicleByCode = this.navContainer.querySelector('#find-vehicle-form');
        this.navBarHamburgerBtn = navBarHamburgerButton;
        this.navEmptySpace = document.querySelector('.nav-empty-space');


        this.navBarHamburgerBtn.addEventListener('click', this.toggleNavMenu.bind(this));
        this.navEmptySpace.addEventListener('click', this.toggleNavMenu.bind(this));
        this.formForFindVehicleByCode.addEventListener('submit', () => {
            const input = this.formForFindVehicleByCode.querySelector('#find-vehicle');
            const inputValue = this.formForFindVehicleByCode.querySelector('#find-vehicle').value;
            if (inputValue) {
                this.toggleNavMenu();
            } else {
                input.classList.add('navbar-input-hover');
                if (input.classList.contains('navbar-input-hover'))
                    setTimeout(() => input.classList.remove('navbar-input-hover'), 1000);
            }
        })

        this.menuElements = {
            menuHeader: this.navBarElem.querySelector('.header-text'),
            sectionTitles: this.navBarElem.querySelectorAll('.section-menu-title'),
            switchContainers: this.navBarElem.querySelectorAll('.switch-container'),
            findButton: this.navBarElem.querySelector('#find-vehicle-submit'),
        }
    }
    toggleNavMenu() {
        const compNavBar = window.getComputedStyle(this.navBarElem);
        let duration = compNavBar.getPropertyValue('transition-duration')
        duration = duration.substring(0, duration.indexOf('s'));

        if (this.navBarElem.classList.contains('navbar-hidden') && this.navContainer.classList.contains('micro')) {
            this.menuElements.menuHeader.classList.add('active-header-text');
            this.menuElements.switchContainers.forEach(sw => sw.classList.remove('switch-container-not-active'));
            this.menuElements.sectionTitles.forEach(sw => sw.classList.add('active-section-menu-title'));
            this.menuElements.findButton.classList.remove('switch-container-not-active');
            this.navContainer.classList.remove('micro')
            this.navBarHamburgerBtn.classList.add('navbar-shown-btn');
            this.navBarElem.classList.remove('navbar-hidden');
            this.navEmptySpace.classList.remove('navbar-hidden');
        } else if (!this.navBarElem.classList.contains('navbar-hidden')) {
            this.menuElements.menuHeader.classList.remove('active-header-text');
            this.menuElements.switchContainers.forEach(sw => sw.classList.add('switch-container-not-active'));
            this.menuElements.sectionTitles.forEach(sw => sw.classList.remove('active-section-menu-title'));
            this.menuElements.findButton.classList.add('switch-container-not-active');
            this.navBarHamburgerBtn.classList.remove('navbar-shown-btn');
            this.navBarElem.classList.add('navbar-hidden');
            this.navEmptySpace.classList.add('navbar-hidden');
            setTimeout(() => this.navContainer.classList.add('micro'), duration * 1000);
        } else {
            console.warn('NavBar aktualnie w użyciu')
        }
    }
}

class InformationMenu {
    constructor(infoContainer, buttonsContainer) {
        this.infoContainer = infoContainer;
        this.infoCardsList = this.infoContainer.querySelectorAll('.info-card');

        this.buttonsContainer = buttonsContainer;

        this.switchButtons = buttonsContainer.querySelectorAll('.switch-btn');
        this.switchButtons.forEach(btn => btn.addEventListener('click', e => {
            this.switchCard.call(this, e.target)
        }))
    }

    switchCard(clickedBtn) {
        let activeCardNumber = this.buttonsContainer.querySelector('.active-swtich-btn').id;
        activeCardNumber = activeCardNumber.substring(activeCardNumber.indexOf('-') + 1, activeCardNumber.length);

        this.switchButtons.forEach(el => el.classList.remove('active-swtich-btn'));
        clickedBtn.classList.add('active-swtich-btn');

        let cardNumber = clickedBtn.id;
        cardNumber = cardNumber.substring(cardNumber.indexOf('-') + 1, cardNumber.length);

        const cardsArr = Array.from(this.infoCardsList);
        let tmp = []
        cardsArr.forEach(el => {
            const cardNo = el.id.substring(el.id.length - 1, el.id.length);
            if (cardNo == cardNumber) {
                tmp.unshift(el);
            } else
                tmp.push(el);
            el.style.transform = `translateX(${-(cardNumber * 100 - 100)}%)`;
        })
    }
}

class FullScreen {
    constructor(fullScreenButton, fullScreenMap, fullscreenInfoDiv, centreOnVehicleBtn, fullScreenInfoDivSwitch) {
        this.fullScreenBtn = fullScreenButton;
        this.fullScreenMap = fullScreenMap;
        this.fullscreenInfoDiv = fullscreenInfoDiv;
        this.centreOnVehicleBtn = centreOnVehicleBtn;
        this.fullScreenInfoDivSwitch = fullScreenInfoDivSwitch;

        this.fullScreenBtn.addEventListener('click', () => this.showFullScreenMap())
        this.fullScreenInfoDivSwitch.addEventListener('click', e => {
            if (e.target.checked && this.fullScreenMap.classList.contains('fullscreen-map')) {
                this.fullscreenInfoDiv.classList.remove('hide-transition-class');
                this.fullscreenInfoDiv.classList.add('info-fullscreen-active');
            } else if (!e.target.checked) {
                this.fullscreenInfoDiv.classList.add('hide-transition-class');
                this.fullscreenInfoDiv.classList.remove('info-fullscreen-active');
            }
        })
        this.centreOnVehicleBtn.addEventListener('click', e => {
            if (!e.target.classList.contains('vehicle-icon-clicked')) {
                e.target.classList.add('vehicle-icon-clicked');
                setTimeout(() => e.target.classList.remove('vehicle-icon-clicked'), 300)
            }
        })
    }
    showFullScreenMap() {
        this.fullScreenBtn.removeEventListener('click', () => this.showFullScreenMap());

        if (this.fullScreenBtn.children[0].classList.contains('fa-chevron-down')) {
            this.fullScreenBtn.children[0].classList.remove('fa-chevron-down');
            this.fullScreenBtn.children[0].classList.add('fa-chevron-up');
            this.fullScreenMap.classList.add('fullscreen-map');
            if (this.fullScreenInfoDivSwitch.checked) {
                this.fullscreenInfoDiv.classList.remove('hide-transition-class');
                this.fullscreenInfoDiv.classList.add('info-fullscreen-active');
            }
        } else {
            this.fullScreenBtn.children[0].classList.remove('fa-chevron-up');
            this.fullScreenBtn.children[0].classList.add('fa-chevron-down');
            this.fullScreenMap.classList.remove('fullscreen-map');
            if (this.fullScreenInfoDivSwitch.checked) {
                this.fullscreenInfoDiv.classList.add('hide-transition-class');
                this.fullscreenInfoDiv.classList.remove('info-fullscreen-active');
            }
        }
        setTimeout(() => this.fullScreenBtn.addEventListener('click', () => this.showFullScreenMap), 0.2 * 1000)

    }
}

class OneOptionSelect {
    constructor(option1, option2) {
        this.buttons = {
            option1: option1,
            option2: option2,
        }
        this.buttons.option1.addEventListener('click', e => this.changeOption.call(this, e.target))
        this.buttons.option2.addEventListener('click', e => this.changeOption.call(this, e.target))
    }

    changeOption(clicked) {
        for (const key in this.buttons) {
            if (this.buttons[key] != clicked)
                this.buttons[key].checked = false;
        }
    }
}

const navBarObj = new NavBar(document.querySelector('.nav-container'), document.querySelector('.nav-btn'));
const infoMenu = new InformationMenu(document.querySelector('#info-container'), document.querySelector('.buttons-container'));
const fullScreenObj = new FullScreen(document.querySelector('.show-fullscreen'), document.querySelector('#mapid'), document.querySelector('.show-info-fullscreen'), document.querySelector('.centre-on-vehicle'), document.querySelector('#show-info-on-fullscreen'));
const oneOptionObj = new OneOptionSelect(document.querySelector('#track-user-position'), document.querySelector('#track-target'));

const fullScreenSwitch = document.querySelector('#fullscreen-web')
fullScreenSwitch.addEventListener('change', e => {
    console.log(fullScreenSwitch);
    if (e.target.checked) {
        console.log('full!');
        document.body.requestFullscreen();
    } else {
        console.log('wylacz');
        document.exitFullscreen();
    }
})



const refreshBtn = document.querySelector('#refresh');
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