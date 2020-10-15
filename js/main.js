const generalBtn = document.querySelector('.general-info-btn');
const vehicleBtn = document.querySelector('.vehicle-info-btn');
const moreBtn = document.querySelector('.more-info-btn');
const cardsList = document.querySelectorAll('.info-card');
const buttonsList = document.querySelectorAll('.switch-btn');
const refreshBtn = document.querySelector('#refresh');

refreshBtn.addEventListener('click', e => {
    const icon = document.querySelector('#refresh+i');
    icon.classList.add('refresh-animation')
    const compIcon = window.getComputedStyle(icon);
    let duration = compIcon.getPropertyValue('animation-duration')
    duration = duration.substring(0, duration.length - 1)
    setTimeout(() => {
        console.log('odpalam');
        icon.classList.remove('refresh-animation');
    }, duration * 1000);
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