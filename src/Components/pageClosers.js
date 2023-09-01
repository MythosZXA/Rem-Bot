const { useState, useEffect } = React;

export default function pageClosers() {
	const [areas, setAreas] = useState([]);
	const [dailiesArray, setDailiesArray] = useState([]);
	const [selectedChar, setSelectedChar]= useState(null);

	useEffect(async () => {
		setAreas((await fetchAreas()).map(objArea => objArea.name));
		setDailiesArray(await fetchDailies());
	}, []);

	// render when dailies change
	useEffect(() => {
		const wantedDiv = document.querySelector('div#containerCLosers div');
		
		dailiesArray.forEach(daily => {
		});
	}, [dailiesArray]);

	return(
		<div class="page-container" id="containerClosers">
			<ul class="closers-list" id="ulClosers">
				<li>Black Lambs</li>
				<li>Wolfdogs</li>
				<li>Wildhuter</li>
				<li>Rattus</li>
			</ul>
			{areas.length > 0 && (
				<div id="divClosersCenter">
					<SideBar areas={areas}/>
					<Areas areas={areas}/>
				</div>
			)}
		</div>
	)
}

function SideBar({areas}) {
	useEffect(() => {
		// click event for each tab
		const displayArea = (event) => {
			// hide previous area
			const activeArea = document.querySelector('div.container-area.active');
			if (activeArea) activeArea.classList.remove('active');

			// display selected area
			const radioIndex = event.target.id[event.target.id.length - 1];
			document.getElementById(`divArea${radioIndex}`).classList.add('active');
		};

		// add click event to each tab, default area 0
		areas.forEach((tab, i) => {
			const radio = document.getElementById(`radioArea${i}`);
			radio.addEventListener("click", displayArea);

			return () => {radio.removeEventListener('click', displayArea)};
		});
		document.getElementById("radioArea0").click();
	}, []);

	return (
		<div id="divAreaSelect">
			<ul>
				{areas.map((tab, i) => (
					<li key={i}>
						<input type="radio" id={`radioArea${i}`} name="radioArea"/>
						<label htmlFor={`radioArea${i}`}>{tab}</label>
					</li>
				))}
			</ul>
		</div>
	);
}

function Areas({areas}) {
	return (
		<React.Fragment>
			{areas.map((tab, i) => (
				<div class="container-area" id={`divArea${i}`} key={i}>
					<div class="sector-group">
						<input type="checkbox" id={`checkbox${i}a`}/>
						<label htmlFor={`checkbox${i}1`}>Checkbox 1</label>
					</div>
					<input type="checkbox"/>
					<input type="checkbox"/>
				</div>
			))}
		</React.Fragment>
	);
}

async function fetchDailies() {
	const response = await fetch('/closers_dailies');
	if (response.status !== 200) {
		console.log('Failed to retrieve Closers dailies');
		return;
	}

	const responseObj = await response.json();
	return responseObj.dailiesArray;
}

async function fetchAreas() {
	const response = await fetch('/closers_areas');
	if (response.status !== 200) {
		console.log('Failed to retrieve Closers areas');
		return;
	}

	const responseObj = await response.json();
	return responseObj.areasArray;
}