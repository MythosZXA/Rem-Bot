const { useState, useRef, useEffect } = React;
import { sendForm } from "../commonFunctions";

export default function PageMessage() {
	const [message, setMessage] = useState('');
	const inputMessage = useRef(null);
	const selectChannel = useRef(null);

	useEffect(async () => {
		const response = await fetch('./textChannels');
		if (response.status === 200) {
			const responseObj = await response.json();
			responseObj.channels.forEach(channel => {
				const option = document.createElement('option');
				option.text = channel.name;
				selectChannel.current.add(option);
			});
		} else {
			console.log('Failed to retrieve channels');
		}
	}, []);

	function sendMessage(event) {
		sendForm(event);
		setMessage('');
		inputMessage.current.focus();
	}

	return(
		<div class="page-container" id="containerMessage">
			<div class="page-message">
				<form action="/message" method="post" onSubmit={sendMessage}>
					<select class="form-input" ref={selectChannel}></select>
					<input
						class="form-input"
						name="message"
						placeholder="Message"
						size="100"
						autocomplete="off"
						value={message}
						ref={inputMessage}
						onChange={event => setMessage(event.target.value)}
					/>
				</form>
			</div>
		</div>
	)
}