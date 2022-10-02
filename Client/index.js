class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {navtabs: [true, false, false, false]};
	}

	clickTab(tabIndex, tabName) {
		// update active tab in state
		const navtabs = this.state.navtabs.slice();
		navtabs.fill(false);
		navtabs[tabIndex] = true;
		this.setState({navtabs: navtabs});
		// display/hide tab's content
		const activeTable = document.querySelector('table.active');
		if (activeTable) activeTable.classList.toggle('active');
		const tabTable = document.getElementById(`table${tabName}`);
		if (tabTable) tabTable.classList.toggle('active');
	}

	renderNavTab(tabIndex, tabName) {
		return <NavTab
			active={this.state.navtabs[tabIndex]}
			name={tabName}
			onClick={() => this.clickTab(tabIndex, tabName)}
		/>;
	}

	render() {
		return (
			<ul class='navbar'>
				{this.renderNavTab(0, 'Home')}
				{this.renderNavTab(1, 'Receipt')}
				{this.renderNavTab(2, 'Message')}
				<li class='navtab dropdown'>
					<a href='javascript:void(0)' class='dropbtn'>Database</a>
					<div class="dropdown-content">
						<a href='./users'>users</a>
						<a href='./tweets'>tweets</a>
					</div>
				</li>
			</ul>
		)
	}
}

class NavTab extends React.Component {
	render() {
		return (
			<li class={this.props.active ? 'navtab active' : 'navtab'} onClick={this.props.onClick}>
				<a>{this.props.name}</a>
			</li>
		)
	}
}

class FormReceipt extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			numInputNickname: 1,
			numInputPrice: 1,
			checkboxesPayer: Array(Array(1).fill(false))		// careful. this start at 0, html elements start at 1
		};
	}

	clickAddPeople() {
		const checkboxesPayer = this.state.checkboxesPayer.slice();
		checkboxesPayer.forEach(checkboxesRow => checkboxesRow.push(false));
		this.setState({
			numInputNickname: this.state.numInputNickname + 1,
			checkboxesPayer: checkboxesPayer
		});
	}

	clickAddItem() {
		const checkboxesPayer = this.state.checkboxesPayer.slice();
		checkboxesPayer.push(Array(this.state.numInputNickname).fill(false));
		this.setState({
			numInputPrice: this.state.numInputPrice + 1,
			checkboxesPayer: checkboxesPayer
		});
	}

	clickCheckbox(priceNum, payerNum) {
		const checkboxesPayer = this.state.checkboxesPayer.slice();
		checkboxesPayer[priceNum - 1][payerNum - 1] = !checkboxesPayer[priceNum - 1][payerNum - 1]
		this.setState({checkboxesPayer: checkboxesPayer});
	}

	submitForm() {
		const debtAmts = Array(this.state.numInputNickname).fill(0);
		for (let i = 1; i <= this.state.numInputPrice; i++) {
			const price = Number(document.getElementById(`price${i}`).value);
			const checkboxesRow = this.state.checkboxesPayer[i - 1];
			const dividedDebt = price / (checkboxesRow.filter(checkbox => checkbox === true)).length;
			checkboxesRow.forEach((checkbox, index) => {
				if (checkbox) { debtAmts[index] += dividedDebt; }
			});
		}
		for (let i = 1; i <= this.state.numInputNickname; i++) {
			document.getElementById(`hiddenDebt${i}`).value = debtAmts[i-1];
		}
		document.getElementById('formReceipt').submit();
	}

	render() {
		const inputNicknames = [];
		const pricePayer = [];
		const hiddenDebts = [];
		for (let i = 1; i <= this.state.numInputNickname; i++) {
			inputNicknames.push(<InputNickname personNum={i}/>);
			hiddenDebts.push(<input type='hidden' id={`hiddenDebt${i}`} name={`hiddenDebt${i}`}/>);
		}
		for (let i = 1; i <= this.state.numInputPrice; i++) {
			pricePayer.push(
				<li class='price-list-item'>
					<InputPrice itemNum={i}/>
					<CheckboxesPayer
						numPayers={this.state.numInputNickname}
						priceNum={i}
						onClick={(priceNum, payerNum) => this.clickCheckbox(priceNum, payerNum)}
					/>
				</li>
			);
		}

		return (
			<form action='./receipt' method='post'>
				<input type='hidden' id='numPayers' name='numPayers' value={this.state.numInputNickname}/>
				{hiddenDebts}
				<table class='receipt' id='tableReceipt'>
					<colgroup width='100%;'>
						<col width='200px;'/>
						<col/>
					</colgroup>
					<tr>
						<td><input type='date' class='form-input' name='date'/></td>
						<td><input class='form-input' name='description' placeholder='Description' size='50' autocomplete='off'/></td>
					</tr>
					<tr>
						<td class='buttonCell'><ButtonAddPerson onClick={() => this.clickAddPeople()}/></td>
						<td>{inputNicknames}</td>
					</tr>
					<tr>
						<td class='buttonCell'><ButtonAddItem onClick={() => this.clickAddItem()}/></td>
						<td>
							<ul class='price-list'>{pricePayer}</ul>
						</td>
					</tr>
					<tr>
						<td><button type='button' class='form-button' onClick={() => this.submitForm()}>Submit</button></td>
					</tr>
				</table>
			</form>
		)
	}
}

class ButtonAddPerson extends React.Component {
	render() {
		return (
			<button
				type='button'
				class='form-button'
				onClick={this.props.onClick}
			>
				Add Person
			</button>
		)
	}
}

class InputNickname extends React.Component {
	render() {
		return (
			<input
				class='form-input'
				name={`nickname${this.props.personNum}`}
				placeholder='DC Nickname'
			/>
		)
	}
}

class ButtonAddItem extends React.Component {
	render() {
		return (
			<button
				type='button'
				class='form-button'
				onClick={this.props.onClick}
			>
				Add Item
			</button>
		)
	}
}

class InputPrice extends React.Component {
	render() {
		return (
			<input
				type='number'
				class='form-input'
				id={`price${this.props.itemNum}`}
				placeholder='Item Price'
			/>
		)
	}
}

class CheckboxesPayer extends React.Component {
	render() {
		const checkboxesPayer = [];
		for (let i = 1; i <= this.props.numPayers; i++) {
			checkboxesPayer.push(
				<input
					type='checkbox'
					class='form-input'
					id={`item${this.props.priceNum}payer${i}`}
					onClick={() => this.props.onClick(this.props.priceNum, i)}
				/>
			);
		}

		return (
			checkboxesPayer
		)
	}
}

class FormMessage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			message: ""
		};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		const formMessage = event.target;
		// formMessage.reset();
	}

	render() {
		return (
			<form action='./message' method='post' onSubmit={this.handleSubmit}>
				<table class='message' id='tableMessage'>
					<tr>
						<td><input class='form-input' name='message' placeholder='Message' size='100' autocomplete='off'/></td>
						<td><button class='form-button'>Send</button></td>
					</tr>
				</table>
			</form>
		)
	}
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<div class='page'>
		<NavBar/>
		<div class='content'>
			<FormReceipt/>
			<FormMessage/>
		</div>
	</div>
);