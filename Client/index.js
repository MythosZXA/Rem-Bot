class NavBar extends React.Component {
	render() {
		return (
			<ul>
				<li><a href='./' class='active'>Home</a></li>
				<li><a>Receipt</a></li>
				<li class='dropdown'>
					<a href='javascript:void(0)' class='dropbtn'>Database</a>
					<div class="dropdown-content">
						<a href='./users'>users</a>
						<a href='./tweets'>tweets</a>
					</div>
				</li>
				<li><a>test</a></li>
			</ul>
		)
	}
}

class FormReceipt extends React.Component {
	render() {
		return (
			<form>
				<table id='table1'>
					<tr>
						<td><label>First</label></td>
						<td><input></input></td>
					</tr>
				</table>
				<table id='table2' style={{display:'none'}}>
					<tr>
						<td><label>Second</label></td>
						<td><input></input></td>
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
		</div>
	</div>
);