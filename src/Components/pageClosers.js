const { useState, useEffect } = React;

export default function pageClosers() {
	const [agents, setAgents] = useState({});
	const [areas, setAreas] = useState([]);
	const [selectedAgent, setSelectedAgent]= useState({});

	// initialize
	useEffect(async () => {
		const [dataAgents, dataAreas] = await Promise.all([fetchData('closers_agents'), fetchData('closers_areas')]);

		setAgents(dataAgents);
		setAreas(dataAreas.map(objArea => objArea.name));
	}, []);

	return(
		<div className="page-container" id="containerClosers">
			<AgentSelect agents={agents} setSelectedAgent={setSelectedAgent}/>
			<h2>{selectedAgent.name}</h2>
			{areas.length > 0 && (
				<div id="divClosersCenter">
					<SideBar areas={areas}/>
					<Areas areas={areas} selectedAgent={selectedAgent}/>
				</div>
			)}
		</div>
	)
}

function AgentSelect({agents, setSelectedAgent}) {
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
							<input
								type="radio"
								className="hidden-input"
								id={`radio${agent.name}`}
								name="radioAgent"
								onChange={() => setSelectedAgent(agent)}
							/>
							<label htmlFor={`radio${agent.name}`}>{agent.name}</label>
						</li>
					))}
				</ul>
			</li>
		)
	}

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

function Areas({areas, selectedAgent}) {
	const [sectors, setSectors] = useState([]);
	const [dailies, setDailies] = useState({});

	// initialize
	useEffect(async () => {
		const [dataDailies, dataSectors] = await Promise.all([fetchData('closers_dailies'), fetchData('closers_sectors')]);

		// turn dailies data into a map utilizing agent id and sector id as key
		const mapDailies = {};
		dataDailies.forEach(daily => {
			const key = `${daily.agent_id}-${daily.sector_id}`;
			mapDailies[key] = daily;
		});

		setDailies(mapDailies);
		setSectors(dataSectors);
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
				<input type="checkbox"
					id={`cbSector${sector.area_id}-${sector.id}`}
          checked={isComplete(sector.id)}
          onChange={(event) => updateDailies(event, sector.id)}
				/>
				<label htmlFor={`cbSector${sector.area_id}-${sector.id}`}>
					{sector.name}
				</label>
			</div>
		));
	};

	const isComplete = (sectorID) => {
    const agentID = selectedAgent.id;
    const key = `${agentID}-${sectorID}`;
    return dailies[key]?.cleared === 1;
  };

  const updateDailies = (event, sectorID) => {
		console.log(dailies)

    const agentID = selectedAgent.id;
    const key = `${agentID}-${sectorID}`;
		setDailies((prevDailies) => {
      return {
        ...prevDailies,
        [key]: {
          ...prevDailies[key],
          cleared: event.target.checked ? 1 : 0,
        },
      };
    });

    fetch('/closers_dailies_update', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify({
				agentID: agentID,
				sectorID: sectorID
			})
		});
  };

	return (
		<React.Fragment>
			{areas.map((tab, i) => (
				<div className="container-area" id={`divArea${i}`} key={i}>
					{selectedAgent.id && renderSectors(i)}
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