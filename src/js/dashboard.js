// src/js/dashboard.js

const busData = [
	{ routeNumber: '33', destination: '지암마을', arrivalMin: 3, origin: '지암마을', via: '운곡모아미래도2차아파트', target: '완주군청', busPosition: '25%' },
	{ routeNumber: '34-1', destination: '운곡모아미래도 2차아파트', arrivalMin: 10, origin: '복합문화지구누에 · 용봉초교', via: '운곡마을', target: '완주군청', busPosition: '35%' },
	{ routeNumber: '50', destination: '소향회차지', arrivalMin: 38, origin: '구만리', via: '운곡마을', target: '완주군청', busPosition: '15%' },
	{ routeNumber: '52', destination: '삼례터미널', arrivalMin: 6, origin: '삼례시장', via: '우석대학교', target: '완주군청', busPosition: '40%' },
	{ routeNumber: '71', destination: '봉동읍', arrivalMin: 18, origin: '봉동시장', via: '둔산공원', target: '완주군청', busPosition: '60%' },
	{ routeNumber: '82', destination: '혁신도시', arrivalMin: 24, origin: '이서면', via: '전북혁신도시', target: '완주군청', busPosition: '45%' },
	{ routeNumber: '90', destination: '고산터미널', arrivalMin: 4, origin: '고산시장', via: '삼례읍', target: '완주군청', busPosition: '30%' }
];

const CARDS_PER_PAGE = 3;
const TRANSITION_DURATION = 800;
const TRANSITION_STAGGER = 150;
const CHANGE_INTERVAL = 10000;
const ARRIVAL_SOON_MIN = 5;

const busIcon = new URL("../assets/images/dashboard/card-bus.svg", import.meta.url).href;

function createBusCardMarkup(item) {
	if (!item) {
		return `
			<div class="bus-card__empty">
				<span class="bus-card__empty-text">배차정보가 없습니다.</span>
			</div>
		`;
	}

	const routeInfo = item.sub
		? `<div class="bus-card__route-destination-wrap">
				<span class="bus-card__route-destination">${item.destination}</span>
				<span class="bus-card__route-sub">${item.sub}</span>
			</div>`
		: `<span class="bus-card__route-destination">${item.destination}</span>`;

	return `
		<div class="bus-card__header">
			<div class="bus-card__route-info">
				<span class="bus-card__route-number">${item.routeNumber}</span>
				${routeInfo}
			</div>
			<div class="bus-card__arrival">
				<span class="bus-card__arrival-time"><strong>${item.arrivalMin}</strong>분 후 도착</span>
			</div>
		</div>

		<div class="bus-card__route" style="--bus-position: ${item.busPosition};">
			<div class="bus-card__track">
				<div class="bus-card__track-line"></div>
				<ol class="bus-card__stops">
					<li class="bus-card__stop bus-card__stop--origin">
						<span class="bus-card__stop-dot"></span>
						<span class="bus-card__stop-label">${item.origin}</span>
					</li>
					<li class="bus-card__stop bus-card__stop--intermediate">
						<span class="bus-card__stop-dot"></span>
						<span class="bus-card__stop-label">${item.via}</span>
					</li>
					<li class="bus-card__stop bus-card__stop--destination">
						<span class="bus-card__stop-pin">
							<span class="bus-card__stop-pin-dot"></span>
							<span class="bus-card__stop-pin-icon" aria-hidden="true"></span>
						</span>
						<span class="bus-card__stop-label">${item.target}</span>
					</li>
				</ol>
			</div>
			<div class="bus-card__bus-icon" aria-label="현재 버스 위치">
				<img src="${busIcon}" alt="">
			</div>
		</div>
	`;
}

function setCardPage(container, pageData, targetFaceClass) {
	const cards = container.querySelectorAll('.bus-card');

	cards.forEach((card, index) => {
		const face = card.querySelector(targetFaceClass);
		if (face) {
			face.innerHTML = createBusCardMarkup(pageData[index]);
		}
	});
}

function initCardFaces(container, pageData) {
	const cards = container.querySelectorAll('.bus-card');

	cards.forEach((card, index) => {
		const front = card.querySelector('.bus-card__face--front');
		const back = card.querySelector('.bus-card__face--back');

		if (!front || !back) return;

		front.innerHTML = createBusCardMarkup(pageData[index]);
		back.innerHTML = '';

		front.classList.add('is-active');
		front.classList.remove('is-next');

		back.classList.remove('is-active', 'is-next');
		card.classList.remove('is-fading');
	});
}

function swapCardPage(card, nextHtml) {
	const front = card.querySelector('.bus-card__face--front');
	const back = card.querySelector('.bus-card__face--back');

	if (!front || !back) return;

	const activeFace = front.classList.contains('is-active') ? front : back;
	const nextFace = activeFace === front ? back : front;

	nextFace.innerHTML = nextHtml;
	nextFace.classList.remove('is-active');
	nextFace.classList.add('is-next');

	requestAnimationFrame(() => {
		card.classList.add('is-fading');

		setTimeout(() => {
			activeFace.classList.remove('is-active');
			activeFace.classList.remove('is-next');

			nextFace.classList.remove('is-next');
			nextFace.classList.add('is-active');

			card.classList.remove('is-fading');
		}, TRANSITION_DURATION);
	});
}

function getPageData(pageIndex) {
	const start = pageIndex * CARDS_PER_PAGE;
	const data = busData.slice(start, start + CARDS_PER_PAGE);

	while (data.length < CARDS_PER_PAGE) {
		data.push(null);
	}

	return data;
}

function updateArrivalBanner() {
	const banner = document.getElementById('arrivalBanner');
	if (!banner) return;

	const emptyEl = banner.querySelector('.map__arrival-empty');
	const listEl = banner.querySelector('.map__arrival-list');
	if (!emptyEl || !listEl) return;

	const soonBuses = busData.filter((item) => item.arrivalMin <= ARRIVAL_SOON_MIN);

	if (soonBuses.length === 0) {
		emptyEl.classList.add('is-visible');
		listEl.classList.remove('is-visible');
		listEl.innerHTML = '';
	} else {
		emptyEl.classList.remove('is-visible');
		listEl.classList.add('is-visible');
		listEl.innerHTML = soonBuses
			.map((item) => `<li class="map__arrival-item"><strong>${item.routeNumber}</strong> ${item.destination}</li>`)
			.join('');
	}
}

function initDashboard() {
	const container = document.getElementById('busCardList');
	if (!container) return;

	const cards = container.querySelectorAll('.bus-card');
	const totalPages = Math.ceil(busData.length / CARDS_PER_PAGE);
	const pages = Array.from({ length: totalPages }, (_, i) => getPageData(i));

	let currentPageIndex = 0;

	if (pages.length > 0) {
		initCardFaces(container, pages[0]);
	}

	updateArrivalBanner();

	function showNextPage() {
		if (pages.length <= 1) return;

		const nextPageIndex = (currentPageIndex + 1) % pages.length;
		const nextPageData = pages[nextPageIndex];

		cards.forEach((card, index) => {
			setTimeout(() => {
				const nextHtml = createBusCardMarkup(nextPageData[index]);
				swapCardPage(card, nextHtml);
			}, index * TRANSITION_STAGGER);
		});

		currentPageIndex = nextPageIndex;
	}

	setInterval(showNextPage, CHANGE_INTERVAL);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initDashboard);
} else {
	initDashboard();
}