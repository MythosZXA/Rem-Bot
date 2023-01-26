const { useState, useRef, useEffect } = React;
import { sendForm } from "../commonFunctions";

export default function PageMessage() {
	const [chatName, setChatName] = useState('');
	const [message, setMessage] = useState('');
	const inputMessage = useRef(null);

	// populate chat select with server members
	useEffect(async () => {
		const response = await fetch('./serverMembers');
		if (response.status !== 200) {
			console.log('Failed to retrieve server members');
			return;
		}

		const responseObj = await response.json();
		responseObj.members.forEach(member => {
			// avatar
			const span = document.createElement('span');
			span.style.backgroundImage = `url(${member.displayAvatarURL})`;
			// name
			const p = document.createElement('p');
			p.textContent = member.nickname;
			// chat tab
			const li = document.createElement('li');
			li.appendChild(span)
			li.appendChild(p);
			li.addEventListener('click', selectChat);
			// add tab to list
			const listMembers = document.querySelector('span.chat-select ul');
			listMembers.appendChild(li);
		});
	}, []);

	// populate chat select with text channels
	useEffect(async () => {
		const response = await fetch('./textChannels');
		if (response.status !== 200) {
			console.log('Failed to retrieve channels');
			return;
		}

		const responseObj = await response.json();
		responseObj.channels.forEach(channel => {
			// chat tab
			const li = document.createElement('li');
			li.textContent = channel.name;
			li.addEventListener('click', selectChat);
			// add tab to list
			const listMembers = document.querySelector('span.chat-select div ul:last-child');
			listMembers.appendChild(li);
		});
	}, []);

	function selectChat() {
		// unselect old chat
		document.querySelector('span.chat-select div ul li.selected')?.classList.toggle('selected');
		// select new chat
		this.classList.toggle('selected');
		// update selected chat name
		setChatName(this.innerText);
	}

	async function sendMessage() {
		const res = await fetch('/message', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify({
				chatName: chatName,
				message: message
			})
		});
		setMessage('');
		inputMessage.current.focus();
	}

	return(
		<div class="page-container" id="containerMessage">
			<div>
				<span class="chat-select">
					<input type="checkbox" id="toggleSelect"/>
					<label for="toggleSelect">
						<span/>
					</label>
					<div>
						<ul/>
						<ul/>
					</div>
				</span>
				<span class="chat-message">
					<input
						class="form-input"
						placeholder="Message"
						size="100"
						autocomplete="off"
						value={message}
						ref={inputMessage}
						onChange={event => setMessage(event.target.value)}
						onKeyPress={event => { if (event.key === 'Enter') sendMessage() }}
					/>
				</span>
			</div>
		</div>
	)
}