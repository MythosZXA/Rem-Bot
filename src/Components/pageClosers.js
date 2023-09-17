const { useState, useEffect } = React;

export default function pageClosers() {
	const [areas, setAreas] = useState([]);
	const [dailiesArray, setDailiesArray] = useState([]);
	const [selectedChar, setSelectedChar]= useState(null);

	useEffect(async () => {
		setAreas((await fetchData('closers_areas')).map(objArea => objArea.name));
		// setDailiesArray(await fetchData('closers_dailies'));
	}, []);

	// render when dailies change
	useEffect(() => {
		const wantedDiv = document.querySelector('div#containerCLosers div');
		
		dailiesArray.forEach(daily => {
		});
	}, [dailiesArray]);

	return(
		<div className="page-container" id="containerClosers">
			<AgentSelect/>
			{areas.length > 0 && (
				<div id="divClosersCenter">
					<SideBar areas={areas}/>
					<Areas areas={areas}/>
				</div>
			)}
		</div>
	)
}

function AgentSelect() {
	const [agents, setAgents] = useState([]);
	const renderSelect = (squadName) => {
		const squadAgents = agents.filter(agent => agent.squad === squadName);

		return(
			<li>
				<div>
					{squadName}
				</div>
				<ul className="dropdown-box">
					{squadAgents.map((agent, i) => (
						<li>
							<input type="radio" className="hidden-input" id={`radio${agent.name}`} name="radioAgent"/>
							<label htmlFor={`radio${agent.name}`}>{agent.name}</label>
						</li>
					))}
				</ul>
			</li>
		)
	}

	useEffect(async () => {
		setAgents((await fetchData('closers_agents')));
	}, [])

	return (
		<ul className="closers-list" id="ulClosers">
			{agents.length > 0 && (
				<React.Fragment>
					{renderSelect("Black Lambs")}
					{renderSelect("Wolfdog")}
					{renderSelect("Wildhuter")}
					{renderSelect("Rattus")}
				</React.Fragment>
			)}
		</ul>
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
						<input type="radio" className="hidden-input" id={`radioArea${i}`} name="radioArea"/>
						<label htmlFor={`radioArea${i}`}>{tab}</label>
					</li>
				))}
			</ul>
		</div>
	);
}

function Areas({areas}) {
	const [sectors, setSectors] = useState([]);

	useEffect(async () => {
		setSectors(await fetchData('closers_sectors'));
	}, []);

	const renderSectors = (areaID) => {
		const returnArr = [];
		const areaSectors = sectors.filter(sector => sector.area_id === areaID);
		for (let row = 1; ; row++) {
			let rowSectors = areaSectors.filter(sector => sector.row === row);
			if (rowSectors.length) {
				returnArr.push(
					<div className="row-sector">
						{renderRow(rowSectors)}
					</div>
				)
			} else {
				break;
			}
		}

		return returnArr;
	}

	const renderRow = (rowSectors) => {
		return rowSectors.map(sector => (
			<div className="sector-group">
				<input type="checkbox" id={`cbSector${sector.area_id}-${sector.id}`}/>
				<label htmlFor={`cbSector${sector.area_id}-${sector.id}`}>{sector.name}</label>
			</div>
		));
	};

	return (
		<React.Fragment>
			{areas.map((tab, i) => (
				<div className="container-area" id={`divArea${i}`} key={i}>
					{renderSectors(i)}
				</div>
			))}
		</React.Fragment>
	);
}

async function fetchData(endpoint) {
	const response = await fetch(`/${endpoint}`);
	if (response.status !== 200) {
		console.log(`Failed to retrieve ${endpoint}`);
		return;
	}

	const responseObj = await response.json();
	return responseObj.dataArray;
}