const { useState, useEffect } = React;

export default function PagePalia() {
	const [villagers, setVillagers] = useState([]);
	const [giftInfo, setGiftInfo] = useState([]);
  const [loading, setLoading] = useState(true);

	// Request villager and gift information from server
	useEffect(async () => {
		const response = await fetch('./palia');
		if (response.status !== 200) {
			console.log('Failed to retrieve Palia information');
			return;
		}

		const responseObj = await response.json()
		setVillagers(responseObj.villagers);
		setGiftInfo(responseObj.giftInfo);
		setLoading(false);
	}, []);

	// Function that determines the prefill of gift checkboxes
	const gifted = (villagerID, giftNumber) => {
		const villagerGiftInfo = giftInfo.find(info => info.villager_id === villagerID);
		return villagerGiftInfo[`gift${giftNumber}`];
	}
	
	// Onchange function of the gift checkboxes
	// Function that sends updated gift data to the server
	const updateData = async (checked, villagerID, giftNumber) => {
		// Send updated updated data to server
		const res = await fetch('/palia-update', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify({
				villagerID: villagerID,
				giftNumber: giftNumber
			})
		});
		
		if (res.status === 200) {
			// Update component state
			setGiftInfo((prevState) => {
				const newState = [...prevState];
				const villagerGiftInfo = newState.find(info => info.villager_id === villagerID);
				villagerGiftInfo[`gift${giftNumber}`] = checked ? 1 : 0;
				return newState;
			});
		} else {
			console.log("Failed to update data");
		}
	}

	return(
		<div class="page-container" id="containerPalia">
			{!loading &&
			(
				villagers.map(villager => (
					<div class="gift-row">
						<span class="villager-icon" style={{ backgroundImage: `url(${villager.image_url})` }}/>
						{["G1", "G2", "G3", "G4"].map((gift, i) => (
							<label class="weekly-gift-label">
								<input
									type="checkbox"
									checked={gifted(villager.id, i+1)}
									onChange={(e) => updateData(e.target.checked, villager.id, i+1)}
								/>
								{gift}
							</label>
						))}
					</div>
				))
			)
			}
		</div>
	)
}