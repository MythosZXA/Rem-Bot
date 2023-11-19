const { useState, useRef, useEffect } = React;
import io from 'socket.io-client'

let socket;
let remAvatarURL;

export default function PageMessage() {
	const [selectedChat, setSelectedChat] = useState('');
	const [messageHistory, setMessageHistory] = useState([]);

	return (
		<div className="page-container" id="containerMessage">
			<ChatSelect
				selectedChat={ selectedChat }
				setSelectedChat={ setSelectedChat }
				setMessageHistory={ setMessageHistory }
			/>
			<span className="chat-message">
				{selectedChat && (<Chat 
					selectedChat={ selectedChat }
					messageHistory={ messageHistory }
					setMessageHistory={ setMessageHistory }
				/>)}
			</span>
		</div>
	)
}

function ChatSelect({ selectedChat, setSelectedChat, setMessageHistory }) {
	const [members, setMembers] = useState([]);
	const [channels, setChannels] = useState([]);

	// populate chat select with server members and text channels
	useEffect(() => {
		setupChatSelect();
	}, []);

	const setupChatSelect = async () => {
		try {
			const [mRes, cRes] = await Promise.all([fetch('./serverMembers'), fetch('./textChannels')]);
	
			if (mRes.ok && cRes.ok) {
				const [mJSON, cJSON] = await Promise.all([mRes.json(), cRes.json()]);
				setMembers(mJSON.members);
				setChannels(cJSON);
				remAvatarURL = mJSON.remAvatarURL;
			} else {
				console.log('Failed to retrieve members and/or channels');
			}
		} catch (e) {
			console.error('Error fetching members and/or channels:', e);
		}
	}

	const selectChat = async (chatName) => {
		// update selected chat name
		setSelectedChat(chatName);

		// load chat messages
		const messageHistory = await retrieveMessageHistory(chatName);
		setMessageHistory(messageHistory);
	}

	const retrieveMessageHistory = async (chatName) => {
		const response = await fetch('/messageHistory', {
			method: 'POST',
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify({
				chatName: chatName
			})
		});
		if (response.status === 200) {
			return await response.json();
		} else {
			console.log('Failed to message history');
			return [];
		}
	}

	return (
		<span className="chat-select">
			<input type="checkbox" id="toggleSelect"/>
			<label htmlFor="toggleSelect">
				<span/>
			</label>
			<div>
				<ul>
					{members.map(member => (
						<li
							className={member.displayName === selectedChat ? "selected" : ""}
							onClick={() => selectChat(member.displayName)}
						>
							<span style={{backgroundImage: `url(${member.displayAvatarURL})`}}/>
							<p>{member.displayName}</p>
						</li>
					))}
				</ul>
				<ul>
					{channels.map(channel => (
						<li
							className={channel.name === selectedChat ? "selected" : ""}
							onClick={() => selectChat(channel.name)}
						>
							<p>{channel.name}</p>
						</li>
					))}
				</ul>
			</div>
		</span>
	)
}

function Chat({ selectedChat, messageHistory, setMessageHistory }) {
	const [message, setMessage] = useState('');
	const inputMessage = useRef(null);

	useEffect(() => {
		if (selectedChat) {
			socket = io('/', { query: { chatName: selectedChat } });
			// socket.on('dcMsg', (msg) => {
			// 	setMessageHistory((prevHistory) => {
			// 		const newHistory = [...prevHistory];
			// 		newHistory.unshift({
			// 			rem: false,
			// 			avatarURL: msg.user.displayAvatarURL,
			// 			content: msg.content
			// 		});
			// 		return newHistory;
			// 	});
			// });
	
			return () => {
				socket.disconnect();
			}
		}
	}, [selectedChat]);

	const sendMessage = () => {
		// send message to server
		socket.emit('remMsg', { chatName: selectedChat, content: message });
		// update chat log
		setMessageHistory((prevHistory) => {
			const newHistory = [...prevHistory];
			newHistory.unshift({
				rem: true,
				avatarURL: remAvatarURL,
				content: message
			});
			return newHistory;
		});
		// reset
		setMessage('');
		inputMessage.current.focus();
	}

	return (
		<React.Fragment>
			<input
				placeholder="Message"
				size="100"
				autocomplete="off"
				value={message}
				ref={inputMessage}
				onChange={(e) => setMessage(e.target.value)}
				onKeyPress={(e) => { if (e.key === 'Enter') sendMessage() }}
			/>
			{messageHistory.map((message, i) => (
				<div key={`mh${i}`}>
					<span
						className={message.rem ? 'right' : 'left'}
						style={{backgroundImage: `url(${message.avatarURL})`}}
					/>
					<p className={message.rem ? 'right' : 'left'}>{message.content}</p>
				</div>
			))}
		</React.Fragment>
	)
}