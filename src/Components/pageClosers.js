const { useState, useEffect } = React;

export default function pageClosers() {
	const [dailiesArray, setDailiesArray] = useState([]);
	const [selectedChar, setSelectedChar]= useState(null);

	// load dailies array
	useEffect(async () => {
		const response = await fetch('/dailies_closers');
		if (response.status !== 200) {
			console.log('Failed to retrieve Closers dailies');
			return;
		}

		const responseObj = await response.json();
		setDailiesArray(responseObj.dailiesArray);
		console.log(responseObj.dailiesArray);
	}, []);

	// render when dailies change
	useEffect(() => {
		const wantedDiv = document.querySelector('div#containerCLosers div');
		// add stuff to this ele
	}, [dailiesArray]);

	return(
		<div class="page-container" id="containerClosers">
			<ul class="closers-list">
				<li>
					Black Lambs
				</li>
				<li>
					Wolfdogs
				</li>
				<li>
					Wildhuter
				</li>
				<li>
					Rattus
				</li>
			</ul>
			<div>
				
			</div>
		</div>
	)
}