const Example = () => {
	return (<h1>Hello person</h1>);
};

const asdf = () => {
	return <button>asdf</button>
}

class asdf1 extends React.Component {
	render() {
		return (
			<table>
				<tr>
					<td>
						<form action='./users'>
							<input type='submit' value='users'></input>
						</form>
					</td>
					<td>
						<form action='./tweets'>
							<input type='submit' value='tweets'></input>
						</form>
					</td>
				</tr>
			</table>
		)
	}
}

ReactDOM.render(React.createElement(asdf1), document.getElementById('root'));