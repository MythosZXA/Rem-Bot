const { useState } = React

export default function LoginLHN() {
	const [input, setInput] = useState();
	const [reqType, setReqType] = useState('N');
	const [nickname, setNickname] = useState();

	function toggleLHN() {
		document.querySelector('div.lhn').classList.toggle('active');
		document.querySelector('button.nav-button').classList.toggle('active');
	}

	function resetLogin() {
		setInput('');
		setReqType('N');
		setNickname();
		document.querySelector('div.right-login input').setAttribute('placeholder', 'DC Nickname');
	}

	async function login() {
		const res = await fetch('/login', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				reqType: reqType,
				nickname: nickname ? nickname : input,
				code: input
			})
		});

		if (reqType === 'N') {
			setReqType('C');
			setNickname(input);
			document.querySelector('div.right-login input').setAttribute('placeholder', '6-Digit Code');
		}

		switch (res.status) {
			case 200:
				document.querySelector('div.left-login').setAttribute('class', 'lhn');
				document.querySelector('div.right-login').classList.add('auth');
				break;
			case 202:
				break;
			case 401:
				break;
			case 404:
				break;
		}

		setInput('');
	}

	function selectTab(event) {
		// unselect previous tab
		document.querySelector('div.lhn ul li.selected').classList.toggle('selected');
		// select new tab
		event.target.classList.toggle('selected');

		// hide previous page
		document.querySelector('div.page-container.active')?.classList.toggle('active');
		// display selected page
		document.getElementById(`container${event.target.innerHTML}`)?.classList.toggle('active');

		// close lhn
		document.querySelector('button.nav-button').click();
	}

	function renderTab(label, firstTab) {
		return <li class={`${firstTab ? 'selected' : ''}`} onClick={selectTab}>{label}</li>
	}

	return(
		<React.Fragment>
			<button class="nav-button" onClick={toggleLHN}>
				<span/>
			</button>
			<div class="left-login">
				<ul class="nav-list">
					{renderTab('Home', true)}
					{renderTab('Receipt')}
					{renderTab('Message')}
					{renderTab('TicTacToe')}
					{renderTab('5')}
				</ul>
			</div>
			<div class="right-login">
				<span/>
				<p>Text</p>
				<input
					value={input}
					placeholder='DC Nickname'
					onChange={event => setInput(event.target.value)}
				/>
				<div>
					<button onClick={resetLogin}>Reset</button>
					<button onClick={login}>Login</button>
				</div>
			</div>
		</React.Fragment>
	)
}