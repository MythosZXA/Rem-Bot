const { useState } = React;

export default function LHN() {
	const [active, setActive] = useState(true);

	function toggleLHN() {
		document.querySelector('div.lhn').style.transform = `translateX(${active ? '-400px' : '0'})`;
		document.querySelector('button.nav-button').classList.toggle('active');
		setActive(!active);
	}

	function selectTab(event) {
		// unselect previous tab
		document.querySelector('li.nav-item.selected').classList.toggle('selected');
		// select new tab
		event.target.classList.toggle('selected');

		// hide previous page
		document.querySelector('div.page.active')?.classList.toggle('active');
		// display selected page
		document.getElementById(`page${event.target.innerHTML}`)?.classList.toggle('active');

		// close lhn
		document.querySelector('button.nav-button').click();
	}

	function renderTab(label, firstTab) {
		return <li class={`nav-item ${firstTab ? 'selected' : ''}`} onClick={selectTab}>{label}</li>
	}

	return(
		<React.Fragment>
			<button class="nav-button active" onClick={toggleLHN}>
				<span/>
			</button>
			<div class="lhn">
				<ul class="nav-list">
					{renderTab('Home', true)}
					{renderTab('Receipt')}
					{renderTab('Message')}
					{renderTab('TicTacToe')}
					{renderTab('5')}
				</ul>
			</div>
		</React.Fragment>
	)
}