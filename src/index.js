import LoginLHN from './Components/loginLHN'
import PageHome from './Components/pageHome'
import PageMessage from './Components/pageMessage'
import PageTicTacToe from './Components/pageTicTacToe'
import PageClosers from './Components/pageClosers'

ReactDOM.render(
	<React.Fragment>
		<LoginLHN/>
		<PageHome/>
		<PageMessage/>
		<PageTicTacToe/>
		<PageClosers/>
	</React.Fragment>,
	document.getElementById('root')
)