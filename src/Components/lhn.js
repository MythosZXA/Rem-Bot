export default function LHN() {
	function toggleLHN() {
		document.querySelector('div.lhn').classList.toggle('active');
		document.querySelector('button.nav-button').classList.toggle('active');
	}

	function selectTab(event) {
		// unselect previous tab
		document.querySelector('li.nav-item.selected').classList.toggle('selected');
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
		return <li class={`nav-item ${firstTab ? 'selected' : ''}`} onClick={selectTab}>{label}</li>
	}

	return(
		<React.Fragment>
			<button class="nav-button active" onClick={toggleLHN}>
				<span/>
			</button>
			<div class="lhn active">
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