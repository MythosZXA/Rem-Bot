export async function sendForm(event) {
	event.preventDefault();
	const formMessage = event.target;
	const formData = new FormData(formMessage);
	const formJSON = JSON.stringify(Object.fromEntries(formData.entries()));
	const response = await fetch(formMessage.action, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: formJSON
	});
	if (response.status === 200) {
		return await response.json();
	} else {
		return false;
	}
}