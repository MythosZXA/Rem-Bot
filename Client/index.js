class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {navtabs: [true, false, false, false]};
	}

	clickTab(tabIndex) {
		// update active tab
		const navtabs = this.state.navtabs.slice();
		navtabs.fill(false);
		navtabs[tabIndex] = true;
		this.setState({navtabs: navtabs});
		// display/hide tab's content
		const tabTable = document.getElementById(`table${tabIndex}`);
		tabIndex === 1 ?
		tabTable.style.removeProperty('display') :
		document.getElementById('table1').style.display = 'none';
	}

	renderNavTab(tabIndex, tabName) {
		return <NavTab
			active={this.state.navtabs[tabIndex]}
			name={tabName}
			onClick={() => this.clickTab(tabIndex)}
		/>;
	}

	render() {
		return (
			<ul class='navbar'>
				{this.renderNavTab(0, 'Home')}
				{this.renderNavTab(1, 'Receipt')}
				<li class='dropdown'>
					<a href='javascript:void(0)' class='dropbtn'>Database</a>
					<div class="dropdown-content">
						<a href='./users'>users</a>
						<a href='./tweets'>tweets</a>
					</div>
				</li>
				{this.renderNavTab(3, 'test')}
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

class FormTest extends React.Component {
	render() {
		return (
			<form action='./message' method='post'>
				<table id='table0'>
					<tr>
						<td><label>First</label></td>
						<td><input name='message'></input></td>
						<td><button type='submit'>Send</button></td>
					</tr>
				</table>
			</form>
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
				<li style={{paddingBottom: '5px', width: '100%', display: 'inline-block'}}>
					<InputPrice itemNum={i}/>
					<CheckboxesPayer onClick={(priceNum, payerNum) => this.clickCheckbox(priceNum, payerNum)} numPayers={this.state.numInputNickname} priceNum={i}/>
				</li>
			);
		}

		return (
			<form id='formReceipt' action='./receipt' method='post'>
				<input type='hidden' id='numPayers' name='numPayers' value={this.state.numInputNickname}/>
				{hiddenDebts}
				<table id='table1' style={{display: 'none', width: '100%'}}>
					<colgroup width='100%;'>
						<col width='90px;'/>
						<col/>
					</colgroup>
					<tr>
						<td><ButtonAddPerson onClick={() => this.clickAddPeople()}/></td>
						<td>{inputNicknames}</td>
					</tr>
					<tr>
						<td style={{display: 'inline-block'}}><ButtonAddItem onClick={() => this.clickAddItem()}/></td>
						<td>
							<ul style={{listStyleType: 'none', paddingLeft: '0'}}>{pricePayer}</ul>
						</td>
					</tr>
					<tr>
						<td><button type='button' onClick={() => this.submitForm()}>Submit</button></td>
					</tr>
				</table>
			</form>
		)
	}
}

class ButtonAddPerson extends React.Component {
	render() {
		return (
			<button type='button' onClick={this.props.onClick}>Add Person</button>
		)
	}
}

class InputNickname extends React.Component {
	render() {
		return (
			<input name={`nickname${this.props.personNum}`} placeholder='DC Nickname'></input>
		)
	}
}

class ButtonAddItem extends React.Component {
	render() {
		return (
			<button type='button' onClick={this.props.onClick}>Add Item</button>
		)
	}
}

class InputPrice extends React.Component {
	render() {
		return (
			<input type='number' id={`price${this.props.itemNum}`} placeholder='Item Price'></input>
		)
	}
}

class CheckboxesPayer extends React.Component {
	render() {
		const checkboxesPayer = [];
		for (let i = 1; i <= this.props.numPayers; i++) {
			checkboxesPayer.push(<input type='checkbox' id={`item${this.props.priceNum}payer${i}`} onClick={() => this.props.onClick(this.props.priceNum, i)}></input>);
		}

		return (
			checkboxesPayer
		)
	}
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<div class='page'>
		<NavBar/>
		<div class='content'>
			<FormReceipt/>
		</div>
	</div>
);